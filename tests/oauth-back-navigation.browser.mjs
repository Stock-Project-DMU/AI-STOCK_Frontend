import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

// 저장소 의존성을 바꾸지 않고 작업 환경의 Playwright로 브라우저 회귀 검증한다.
// 먼저 npm run build 후 별도 터미널에서 npm run start -- --hostname 127.0.0.1 --port 3107 실행.
// Playwright가 설치된 환경에서 node tests/oauth-back-navigation.browser.mjs로 실행한다.
// 외부 런타임은 PLAYWRIGHT_PACKAGE(package.json 경로), TEST_BROWSER(브라우저 실행 파일 경로)로 지정할 수 있다.
const runtimeRequire = createRequire(process.env.PLAYWRIGHT_PACKAGE ?? import.meta.url);
const { chromium } = runtimeRequire('playwright');
const loginUrl = 'http://localhost:3107/login';
const authorizeUrl = /\/api\/auth\/oauth\/(KAKAO|NAVER|GOOGLE)\/authorize$/;

async function enabled(page) {
    await page.waitForFunction(() => {
        const buttons = [...document.querySelectorAll('button[aria-label$=" 로그인"], form:has(#login-user-id) button[type="submit"]')];
        return buttons.length === 4 && buttons.every(button => !button.disabled);
    });
}

async function main() {
    const external = http.createServer((_, response) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end('<html><body>OAuth test provider</body></html>');
    });
    await new Promise(resolve => external.listen(3108, '127.0.0.1', resolve));
    let browser;
    try {
        browser = await chromium.launch({
            executablePath: process.env.TEST_BROWSER,
            headless: true,
            ignoreDefaultArgs: ['--disable-back-forward-cache'],
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        page.setDefaultTimeout(15_000);
        await page.addInitScript(() => {
            window.addEventListener('pageshow', event => {
                sessionStorage.setItem('test.pageshow.persisted', String(event.persisted));
            });
        });
        let release;
        let hold = false;
        const requested = [];
        const corsHeaders = {
            'Access-Control-Allow-Origin': 'http://localhost:3107',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'content-type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        };
        await page.route(authorizeUrl, async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 204, headers: corsHeaders });
                return;
            }
            const provider = route.request().url().match(authorizeUrl)[1];
            requested.push(provider);
            if (hold) {
                await new Promise(resolve => { release = resolve; });
                await route.fulfill({ status: 503, headers: corsHeaders, json: { success: false, message: '테스트 요청 종료' } });
            } else {
                await route.fulfill({
                    json: { success: true, data: { state: 'test-state', url: `http://127.0.0.1:3108/${provider}` } },
                    headers: corsHeaders,
                });
            }
        });
        await page.goto(loginUrl);
        await enabled(page);

        // 초기 표시 이벤트가 진행 중인 요청을 풀지 않는지, 캐시 복원 이벤트가 네 버튼 모두를 복구하는지 확인한다.
        for (const name of ['카카오', '네이버', '구글']) {
            hold = true;
            release = undefined;
            await page.getByRole('button', { name: `${name} 로그인`, exact: true }).click();
            await page.waitForFunction(() => document.querySelector('form:has(#login-user-id) button[type="submit"]').disabled);
            await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false })));
            assert.equal(await page.locator('form:has(#login-user-id) button[type="submit"]').isDisabled(), true);
            await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
            await enabled(page);
            while (!release) await new Promise(resolve => setTimeout(resolve, 20));
            release();
            await page.getByText('테스트 요청 종료', { exact: true }).waitFor();
            await enabled(page);
            console.log(`${name}: 캐시 복원 이벤트 후 모든 로그인 버튼 활성화, 일반 pageshow는 요청 잠금 유지`);
        }

        hold = false;
        for (const [name, provider] of [['카카오', 'KAKAO'], ['네이버', 'NAVER'], ['구글', 'GOOGLE']]) {
            await page.getByRole('button', { name: `${name} 로그인`, exact: true }).click();
            await page.waitForURL(`http://127.0.0.1:3108/${provider}`);
            // BFCache 복귀는 새 load 이벤트가 없을 수 있으므로 URL과 UI 상태로 완료를 확인한다.
            await page.goBack({ waitUntil: 'commit', timeout: 3_000 }).catch(error => {
                if (page.url() !== loginUrl) throw error;
            });
            await page.waitForURL(loginUrl, { waitUntil: 'commit' });
            await enabled(page);
            console.log(`${name}: 외부 인증 화면 → 뒤로 가기 후 버튼 재사용 가능 (pageshow.persisted=${await page.evaluate(() => sessionStorage.getItem('test.pageshow.persisted'))})`);
        }
        assert.equal(requested.length, 6);

        let loginCount = 0;
        await page.route('**/api/auth/login', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 204, headers: corsHeaders });
                return;
            }
            loginCount++;
            await route.fulfill({ status: 401, headers: corsHeaders, json: { success: false, code: 'INVALID_PASSWORD', message: '비밀번호가 일치하지 않습니다.' } });
        });
        await page.locator('#login-user-id').fill('test-user');
        await page.locator('#login-password').fill('test-password');
        await page.locator('form:has(#login-user-id) button[type="submit"]').click();
        await page.getByText('비밀번호가 일치하지 않습니다.', { exact: true }).waitFor();
        await enabled(page);
        assert.equal(loginCount, 1);
        console.log('뒤로 복귀 후 일반 로그인 요청 및 오류 후 재시도 가능 확인');

        const suspensionTitle = '계정 이용이 정지되었습니다';
        async function callbackCase(provider, alias, result, closeWithEscape = false) {
            const callbackContext = await browser.newContext();
            try {
                const callbackPage = await callbackContext.newPage();
                callbackPage.setDefaultTimeout(15_000);
                await callbackPage.addInitScript(({ provider }) => {
                    if (window.location.pathname.includes('/oauth/')) {
                        sessionStorage.setItem('aistock.oauth', JSON.stringify({ provider, state: 'test-state', createdAt: Date.now() }));
                    }
                }, { provider });
                await callbackPage.route('**/api/**', async route => {
                    if (route.request().method() === 'OPTIONS') {
                        await route.fulfill({ status: 204, headers: corsHeaders });
                    } else if (route.request().url().endsWith('/api/auth/oauth/login')) {
                        await route.fulfill({ status: result.status, headers: corsHeaders, json: result.payload });
                    } else if (route.request().url().endsWith('/api/users/me')) {
                        await route.fulfill({ headers: corsHeaders, json: { success: true, data: {
                            userId: 1, loginId: 'test-user', name: '테스트 회원', role: 'USER',
                            email: 'test@example.com', birthdate: '2000-01-01',
                        } } });
                    } else {
                        await route.fulfill({ status: 404, headers: corsHeaders, json: { success: false, message: '테스트 API 없음' } });
                    }
                });
                const callbackPath = alias ? `/oauth/${provider.toLowerCase()}/callback` : `/oauth/callback/${provider.toLowerCase()}`;
                await callbackPage.goto(`http://localhost:3107${callbackPath}?code=test-code&state=test-state`);
                if (result.payload.code === 'USER_SUSPENDED') {
                    const modal = callbackPage.getByRole('alertdialog', { name: suspensionTitle });
                    await modal.waitFor();
                    assert.equal(await modal.getAttribute('aria-modal'), 'true');
                    assert.equal(await modal.evaluate(dialog => dialog.contains(document.activeElement)), true);
                    // 네이티브 모달이 배경의 로그인 링크로 포커스가 빠지는 것을 막는지 확인한다.
                    await callbackPage.locator('main > a').evaluate(link => link.focus());
                    assert.equal(await modal.evaluate(dialog => dialog.contains(document.activeElement)), true);
                    assert.equal(await callbackPage.evaluate(() => localStorage.getItem('aistock.accessToken')), null);
                    assert.equal(await callbackPage.evaluate(() => sessionStorage.getItem('aistock.oauth')), null);
                    assert.equal(new URL(callbackPage.url()).search, '');
                    if (process.env.TEST_MODAL_SCREENSHOT && provider === 'KAKAO' && !alias) {
                        await callbackPage.screenshot({ path: process.env.TEST_MODAL_SCREENSHOT });
                    }
                    if (closeWithEscape) await callbackPage.keyboard.press('Escape');
                    else await modal.getByRole('button', { name: '로그인 화면으로 돌아가기' }).click();
                    await callbackPage.waitForURL(loginUrl, { waitUntil: 'commit' });
                    await enabled(callbackPage);
                    console.log(`${provider} ${callbackPath}: 정지 모달·포커스·토큰 미저장·${closeWithEscape ? 'Escape' : '확인'} 후 로그인 복귀 통과`);
                } else if (result.status !== 200) {
                    await callbackPage.getByRole('alert').filter({ hasText: result.payload.message }).waitFor();
                    assert.equal(await callbackPage.getByRole('alertdialog').count(), 0);
                    console.log(`${callbackPath}: 정지와 무관한 오류는 기존 텍스트 안내 유지`);
                } else {
                    await callbackPage.waitForURL('http://localhost:3107/home', { waitUntil: 'commit' });
                    assert.equal(await callbackPage.getByRole('alertdialog').count(), 0);
                    console.log(`${callbackPath}: 정상 소셜 로그인 후 홈 이동 통과`);
                }
            } finally {
                await callbackContext.close();
            }
        }
        for (const provider of ['KAKAO', 'NAVER', 'GOOGLE']) {
            for (const alias of [false, true]) {
                await callbackCase(provider, alias, {
                    status: 423,
                    payload: { success: false, code: 'USER_SUSPENDED', message: '관리자에 의해 정지된 계정입니다.' },
                }, alias);
            }
        }
        await callbackCase('KAKAO', false, {
            status: 423,
            payload: { success: false, code: 'ADMIN_CODE_LOCKED', message: '테스트 잠금 오류' },
        });
        await callbackCase('GOOGLE', true, {
            status: 200,
            payload: { success: true, data: { accessToken: 'test-access', refreshToken: 'test-refresh', name: '테스트 회원' } },
        });
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => external.close(resolve));
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
