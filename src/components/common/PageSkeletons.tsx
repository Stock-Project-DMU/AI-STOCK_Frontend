type SkeletonProps = {
    className?: string;
};

function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={`animate-pulse rounded-md bg-surface-strong motion-reduce:animate-none ${className}`}
        />
    );
}

function LoadingStatus() {
    return <span className="sr-only">페이지를 불러오는 중입니다.</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`rounded-xl border border-hairline bg-white p-4 ${className}`}>{children}</div>;
}

export function HomePageSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-screen">
            <LoadingStatus />
            <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 grid items-center gap-4 xl:grid-cols-[minmax(0,1fr)_500px]">
                    <Skeleton className="h-9 w-full max-w-xl" />
                    <Card className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-14" />)}
                    </Card>
                </div>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
                    <Card className="overflow-hidden p-0">
                        <div className="flex items-center justify-between border-b border-hairline p-4">
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-8 w-72" />
                        </div>
                        <div className="space-y-1 p-4">
                            {[0, 1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-12 w-full" />)}
                        </div>
                    </Card>
                    <div className="space-y-4">
                        <Card><Skeleton className="h-36 w-full" /></Card>
                        <Card><Skeleton className="h-24 w-full" /></Card>
                        <Card><Skeleton className="h-52 w-full" /></Card>
                    </div>
                </div>
            </section>
        </main>
    );
}

export function AuthPageSkeleton() {
    return (
        <main role="status" className="market-theme auth-shell min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:py-16">
            <LoadingStatus />
            <div className="auth-card mx-auto grid min-h-[650px] w-full max-w-[1080px] overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_.95fr]">
                <section className="hidden border-r border-hairline bg-surface-strong p-12 lg:block">
                    <Skeleton className="h-12 w-4/5" />
                    <Skeleton className="mt-5 h-5 w-2/3" />
                    <div className="mt-[390px] grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20" />)}
                    </div>
                </section>
                <section className="flex flex-col justify-center p-7 sm:p-12">
                    <Skeleton className="h-10 w-32" />
                    <div className="mt-8 space-y-5">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item}>
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="mt-2 h-12 w-full" />
                            </div>
                        ))}
                        <Skeleton className="h-12 w-full rounded-full" />
                    </div>
                </section>
            </div>
        </main>
    );
}

export function AiWorkspaceSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-[calc(100vh-72px)] p-3 sm:p-5">
            <LoadingStatus />
            <div className="mx-auto grid min-h-[720px] w-full max-w-[1540px] gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Card className="space-y-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-full" />
                    {[0, 1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-16 w-full" />)}
                </Card>
                <Card className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-hairline pb-4">
                        <Skeleton className="h-8 w-52" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                    <div className="flex-1 space-y-5 py-8">
                        <Skeleton className="h-24 w-2/3" />
                        <Skeleton className="ml-auto h-16 w-1/2" />
                        <Skeleton className="h-32 w-3/4" />
                    </div>
                    <Skeleton className="h-14 w-full" />
                </Card>
            </div>
        </main>
    );
}

export function GoalSimulationSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-[calc(100vh-72px)] p-4 sm:p-6">
            <LoadingStatus />
            <div className="mx-auto w-full max-w-[1500px]">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="mt-3 h-5 w-96 max-w-full" />
                <div className="mt-6 grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <Card className="space-y-5">
                        {[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 w-full" />)}
                        <Skeleton className="h-12 w-full" />
                    </Card>
                    <div className="space-y-4">
                        <Card><Skeleton className="h-[360px] w-full" /></Card>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[0, 1, 2].map((item) => <Card key={item}><Skeleton className="h-20 w-full" /></Card>)}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export function MyPageSkeleton() {
    return (
        <main role="status" className="market-theme market-grid flex min-h-[calc(100vh-4rem)]">
            <LoadingStatus />
            <aside className="hidden w-64 border-r border-hairline bg-white p-5 lg:block">
                <Skeleton className="h-8 w-32" />
                <div className="mt-8 space-y-3">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div>
            </aside>
            <section className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-8">
                <Card className="mx-auto min-h-[680px] w-full max-w-[1540px] p-6">
                    <Skeleton className="h-8 w-44" />
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {[0, 1, 2, 3, 4, 5].map((item) => (
                            <div key={item}>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="mt-2 h-12 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end gap-3"><Skeleton className="h-11 w-24" /><Skeleton className="h-11 w-28" /></div>
                </Card>
            </section>
        </main>
    );
}

export function StockDetailSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-[calc(100vh-72px)] bg-[var(--market-bg)]">
            <LoadingStatus />
            <section className="border-b border-hairline bg-white p-5">
                <div className="mx-auto max-w-[1500px]">
                    <Skeleton className="h-5 w-52" />
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
                        <div><Skeleton className="h-9 w-56" /><Skeleton className="mt-4 h-12 w-72" /></div>
                        <div className="grid w-full max-w-[620px] grid-cols-2 gap-2 sm:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-16" />)}</div>
                    </div>
                </div>
            </section>
            <div className="mx-auto grid w-full max-w-[1540px] gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <Card><Skeleton className="h-8 w-40" /><Skeleton className="mt-5 h-[430px] w-full" /></Card>
                    <Card className="space-y-2">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => <Skeleton key={item} className="h-8 w-full" />)}</Card>
                </div>
                <Card className="space-y-4"><Skeleton className="h-9 w-full" />{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)}<Skeleton className="h-12 w-full" /></Card>
            </div>
        </main>
    );
}

export function NewsReportSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-screen">
            <LoadingStatus />
            <section className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-3 h-11 w-56" />
                <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-5">
                        <Card className="grid min-h-80 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="space-y-4"><Skeleton className="h-7 w-32" /><Skeleton className="h-20 w-full" /><Skeleton className="h-16 w-full" /></div>
                            <Skeleton className="min-h-64 w-full" />
                        </Card>
                        <div className="flex items-center justify-between"><Skeleton className="h-8 w-32" /><Skeleton className="h-10 w-96 max-w-[50%]" /></div>
                        <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-10 w-10" /><Skeleton className="mt-5 h-14 w-full" /><Skeleton className="mt-4 h-12 w-full" /></Card>)}</div>
                    </div>
                    <div className="space-y-3">{[0, 1, 2].map((item) => <Card key={item}><Skeleton className="h-6 w-32" /><Skeleton className="mt-4 h-36 w-full" /></Card>)}</div>
                </div>
            </section>
        </main>
    );
}

export function NewsArticleSkeleton() {
    return (
        <main role="status" className="market-theme market-grid min-h-screen">
            <LoadingStatus />
            <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <Skeleton className="h-6 w-28" />
                <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <Card className="overflow-hidden p-0">
                        <div className="px-5 py-7 sm:px-9 lg:px-12">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="mt-6 h-24 w-full max-w-3xl" />
                            <Skeleton className="mt-5 h-14 w-full max-w-2xl" />
                            <Skeleton className="mt-7 h-6 w-64" />
                        </div>
                        <Skeleton className="aspect-[16/8] w-full rounded-none" />
                        <div className="space-y-8 px-5 py-8 sm:px-9 lg:px-12">
                            <Skeleton className="h-40 w-full" />
                            {[0, 1, 2].map((item) => <div key={item}><Skeleton className="h-8 w-52" /><Skeleton className="mt-4 h-24 w-full" /></div>)}
                        </div>
                    </Card>
                    <div className="space-y-4"><Card><Skeleton className="h-32 w-full" /></Card><Card><Skeleton className="h-64 w-full" /></Card></div>
                </div>
            </div>
        </main>
    );
}

export function AdminPageSkeleton() {
    return (
        <main role="status" className="market-theme flex min-h-screen bg-surface-soft">
            <LoadingStatus />
            <aside className="hidden w-64 bg-[#111827] p-5 lg:block"><Skeleton className="h-9 w-36 bg-white/15" /><div className="mt-8 space-y-3">{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-12 bg-white/10" />)}</div></aside>
            <section className="flex-1 p-5 lg:p-7">
                <Skeleton className="h-10 w-64" />
                <div className="mt-6 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <Card key={item}><Skeleton className="h-20" /></Card>)}</div>
                <Card className="mt-5 space-y-3"><Skeleton className="h-10 w-full" />{[0, 1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</Card>
            </section>
        </main>
    );
}

export function WelcomePageSkeleton() {
    return (
        <main role="status" className="market-theme auth-shell flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16">
            <LoadingStatus />
            <div className="w-full max-w-3xl text-center">
                <Skeleton className="mx-auto h-16 w-full max-w-2xl" />
                <Skeleton className="mx-auto mt-6 h-6 w-full max-w-lg" />
                <div className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-24" />)}</div>
                <Skeleton className="mx-auto mt-10 h-14 w-48 rounded-full" />
            </div>
        </main>
    );
}

export function ProtectedPageSkeleton({ pathname }: { pathname: string }) {
    if (pathname.startsWith("/my-page")) return <MyPageSkeleton />;
    if (pathname.startsWith("/goal-simulation")) return <GoalSimulationSkeleton />;
    return <AiWorkspaceSkeleton />;
}
