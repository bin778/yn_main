/** marked 등에서 나온 표 HTML을 Tiptap Table 스키마에 맞게 정규화 */
export function normalizeTablesForEditor(html: string): string {
  if (html === '' || typeof document === 'undefined') {
    return html;
  }

  const root = document.createElement('div');
  root.innerHTML = html;

  root.querySelectorAll('table').forEach(table => {
    table.querySelectorAll('thead, tbody, tfoot').forEach(section => {
      while (section.firstChild) {
        table.insertBefore(section.firstChild, section);
      }
      section.remove();
    });

    table.querySelectorAll('th, td').forEach(cell => {
      if (cell.querySelector('p, h2, h3, h4, ul, ol, blockquote')) {
        return;
      }
      const inner = cell.innerHTML.trim();
      cell.innerHTML = inner ? `<p>${inner}</p>` : '<p></p>';
    });
  });

  return root.innerHTML;
}
