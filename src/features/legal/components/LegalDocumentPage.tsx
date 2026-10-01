import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/navigation";
import { LEGAL_TABLES, type LegalDocument } from "../documents";

export default function LegalDocumentPage({ document, pathname }: {
    document: LegalDocument;
    pathname: string;
}) {
    return (
        <article className="mx-auto w-full max-w-[1000px] px-5 py-10 text-body sm:px-10 sm:py-14">
            <header className="border-b border-hairline pb-7">
                <h1 className="text-[28px] font-bold leading-tight text-ink sm:text-[32px]">{document.title}</h1>
                <p className="mt-3 text-sm leading-6 text-muted">{document.sourceTitle}</p>
                <nav aria-label="약관 및 서비스 안내" className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    {FOOTER_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}
                            className={`text-sm font-semibold hover:text-primary ${pathname === link.href ? "text-primary" : "text-body"}`}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </header>
            <div className="space-y-9 pt-9">
                {document.sections.map((section, sectionIndex) => (
                    <section key={`${sectionIndex}-${section.title}`} aria-labelledby={`legal-section-${sectionIndex}`}>
                        <h2 id={`legal-section-${sectionIndex}`} className="mb-3 text-lg font-bold leading-7 text-ink">{section.title}</h2>
                        <div className="space-y-2 text-sm leading-7 [overflow-wrap:anywhere]">
                            {section.paragraphs.map((paragraph, index) => {
                                const table = LEGAL_TABLES.find((item) => paragraph.startsWith(item.prefix));
                                if (table) {
                                    return (
                                        <div key={index} className="my-4 overflow-x-auto rounded-sm border border-hairline" tabIndex={0} role="region" aria-label={`${section.title} 표`}>
                                            <table className="w-full min-w-[540px] border-collapse text-left text-sm leading-6">
                                                <caption className="sr-only">{section.title}</caption>
                                                <thead className="bg-surface-strong text-ink">
                                                    <tr>{table.headers.map((cell) => <th key={cell} scope="col" className="px-4 py-3 font-semibold">{cell}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {table.rows.map((row, rowIndex) => (
                                                        <tr key={rowIndex} className="border-t border-hairline">
                                                            {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top">{cell}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                }
                                return <p key={index} className={/^\d+\)/.test(paragraph) ? "pl-4" : undefined}>{paragraph}</p>;
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </article>
    );
}
