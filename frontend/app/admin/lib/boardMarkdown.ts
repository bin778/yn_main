import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { sanitizeBoardHtml } from './sanitizeBoardHtml';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

turndown.use(gfm);

turndown.addRule('horizontalRule', {
  filter: 'hr',
  replacement: () => '\n\n---\n\n',
});

turndown.addRule('highlight', {
  filter: 'mark',
  replacement: (content, node) => {
    const element = node as HTMLElement;
    const dataColor = element.getAttribute('data-color');
    if (dataColor) {
      return `<mark data-color="${dataColor}">${content}</mark>`;
    }
    return `==${content}==`;
  },
});

marked.setOptions({
  gfm: true,
  breaks: true,
});

function normalizeStrikeTags(html: string): string {
  return html.replace(/<del(\s[^>]*)?>/gi, '<s$1>').replace(/<\/del>/gi, '</s>');
}

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
  return sanitizeBoardHtml(normalizeStrikeTags(raw));
}
