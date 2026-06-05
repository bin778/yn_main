import { marked } from 'marked';
import TurndownService from 'turndown';

import { sanitizeBoardHtml } from './sanitizeBoardHtml';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

turndown.addRule('horizontalRule', {
  filter: 'hr',
  replacement: () => '\n\n---\n\n',
});

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function boardHtmlToMarkdown(html: string): string {
  const cleaned = sanitizeBoardHtml(html);
  if (cleaned === '') {
    return '';
  }

  return turndown.turndown(cleaned).trim();
}

export function boardMarkdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (trimmed === '') {
    return '';
  }

  const parsed = marked.parse(trimmed, { async: false });
  const raw = typeof parsed === 'string' ? parsed : '';
  return sanitizeBoardHtml(raw);
}
