/** marked 등에서 나온 표 HTML을 Tiptap Table 스키마에 맞게 정규화 */
export function normalizeTablesForEditor(html: string): string {
  if (html === '' || typeof document === 'undefined') {
    return html;
  }

  const root = document.createElement('div');
  root.innerHTML = html;

  root.querySelectorAll('table').forEach(table => {
    // querySelectorAll은 중첩 테이블의 thead/tbody/tfoot도 반환하므로
    // 직계 자식만 필터링해야 insertBefore 오류가 발생하지 않는다.
    Array.from(table.children)
      .filter(child => /^(THEAD|TBODY|TFOOT)$/i.test(child.tagName))
      .forEach(section => {
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
