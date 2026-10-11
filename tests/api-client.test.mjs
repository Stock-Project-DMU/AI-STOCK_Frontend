import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function client(fetch) {
    const values = new Map();
    const storage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
    };
    const context = {
        exports: {}, process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://ai-stock.me.kr' } },
        window: { localStorage: storage, dispatchEvent() {} },
        fetch, Headers, Response, Event,
    };
    const source = fs.readFileSync(new URL('../src/lib/api/client.ts', import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
    vm.runInNewContext(compiled.outputText, context);
    return { api: context.exports, values };
}

test('프록시의 HTML 오류 응답은 서버 장애로 안내한다', async () => {
    const { api } = client(async () => new Response('<h1>Bad Gateway</h1>', { status: 502 }));
    await assert.rejects(api.apiRequest('/api/market'), error =>
        error.status === 502 && api.getApiErrorMessage(error, '조회 실패').includes('서버가 준비 중'));
});

test('일반 로그인 비밀번호 불일치 메시지는 인증 만료로 바뀌지 않는다', async () => {
    const { api } = client(async () => Response.json({ success: false, code: 'INVALID_PASSWORD', message: '비밀번호가 일치하지 않습니다.' }, { status: 401 }));
    await assert.rejects(api.apiRequest('/api/auth/login', { auth: false }), error =>
        api.getApiErrorMessage(error, '로그인 실패') === '비밀번호가 일치하지 않습니다.');
});

test('토큰 갱신 중 서버 장애가 나면 로그인 정보를 지우지 않는다', async () => {
    let count = 0;
    const { api, values } = client(async () => ++count === 1
        ? Response.json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 })
        : new Response('Service Unavailable', { status: 503 }));
    api.saveAuthTokens({ accessToken: 'existing-access', refreshToken: 'existing-refresh' });
    await assert.rejects(api.apiRequest('/api/users/me'), error => error.status === 503);
    assert.equal(values.get('aistock.refreshToken'), 'existing-refresh');
});

test('정상 JSON이더라도 API 응답 구조가 잘못되면 형식 오류로 안내한다', async () => {
    const { api } = client(async () => Response.json(null));
    await assert.rejects(api.apiRequest('/api/market'), error => error.message.includes('응답 형식'));
});

test('업무 오류의 구체적인 한도 안내는 보존한다', () => {
    const { api } = client(async () => {});
    const message = '관리자 계좌의 남은 충전 가능 금액은 123원입니다.';
    assert.equal(api.getApiErrorMessage(new api.ApiError(message, 400, 'DEPOSIT_LIMIT_EXCEEDED'), '실패'), message);
});

test('인증 토큰 오류는 사용자가 취할 행동으로 안내한다', () => {
    const { api } = client(async () => {});
    assert.match(api.getApiErrorMessage(new api.ApiError('유효하지 않은 토큰입니다.', 401, 'INVALID_TOKEN'), '실패'), /다시 로그인/);
});
