import { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    try {
      return marked.parse(content || '', {
        gfm: true,
        breaks: true,
      }) as string;
    } catch {
      return content || '';
    }
  }, [content]);

  return (
    <div
      className="prose-assistant select-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
