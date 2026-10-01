import { Fragment } from "react";

// Support both named Markdown links and URLs written directly in AI answers.
export function parsePlannerLinks(content: string) {
    const pattern = /\[([^\]\n]+)\]\((https?:\/\/(?:[^\s<>()]|\([^\s<>()]*\))+)\)|(https?:\/\/[^\s<>"']+)/gi;
    const parts: { text: string; href?: string }[] = [];
    let cursor = 0;
    for (const match of content.matchAll(pattern)) {
        let href = match[2] ?? match[3];
        let length = match[0].length;
        if (!match[2]) {
            // Sentence punctuation and unmatched closing brackets are not URL content.
            while (/[.,!?;:。！？\]}]$/.test(href)
                || (href.endsWith(")") && (href.match(/\)/g)?.length ?? 0) > (href.match(/\(/g)?.length ?? 0))) {
                href = href.slice(0, -1);
                length--;
            }
        }
        try {
            const url = new URL(href);
            if (!url.hostname || !["http:", "https:"].includes(url.protocol)) continue;
        } catch { continue; }
        if (match.index > cursor) parts.push({ text: content.slice(cursor, match.index) });
        parts.push({ text: match[1] ?? href, href });
        cursor = match.index + length;
    }
    if (cursor < content.length) parts.push({ text: content.slice(cursor) });
    return parts;
}

export default function PlannerMessageContent({ content }: { content: string }) {
    return <>{parsePlannerLinks(content).map((part, index) => part.href
        ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-primary underline underline-offset-2 hover:opacity-80">{part.text}</a>
        : <Fragment key={index}>{part.text}</Fragment>)}</>;
}
