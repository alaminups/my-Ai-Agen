import { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    try {
      // Replace [FLAG_ALERT: SUSPICIOUS: reason] or [FLAG_ALERT: SUSPICIOUS] with a styled warning banner
      const sanitized = (content || '').replace(
        /\[FLAG_ALERT:\s*SUSPICIOUS(?::\s*([^\]]+))?\]/gi,
        (_match, reason) => {
          const reasonText = reason ? `: ${reason.trim()}` : '';
          return `\n\n<div class="my-2.5 p-3 rounded-lg bg-rose-950/80 border border-rose-500/70 text-rose-200 text-xs font-mono shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-start gap-2">
            <span class="text-rose-400 font-extrabold shrink-0">🚨 [SECURITY FLAG]</span>
            <div>
              <span class="font-bold text-rose-300">Suspicious Activity Flagged & Logged to Admin Security Monitor</span>
              ${reasonText ? `<div class="text-[11px] text-rose-300/80 mt-0.5">${reasonText}</div>` : ''}
            </div>
          </div>\n\n`;
        }
      );

      return marked.parse(sanitized, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch {
      return content || '';
    }
  }, [content]);

  return (
    <div
      className="prose-assistant select-text leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
