import { sanitizeContentForSave } from '../app/admin/lib/boardContentSanitize';
import { sanitizeLegacyBoardHtml } from '../app/admin/lib/sanitizeLegacyBoardHtml';

const CTA_SNIPPET = `
<div style="background-color: #F8F9FA; padding: 40px 20px; border: 1px solid #E2E8F0; margin: 60px 0; text-align: center;">
<div style="max-width: 380px; margin: 0 auto; background-color: #1C2B4A; border-radius: 50px;">
<a href="tel:02-318-2981" style="display: block; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 17px; line-height: 54px; text-align: center;">서울</a>
</div>
<div style="height: 15px; font-size: 0; line-height: 0;">&nbsp;</div>
</div>
`;

const TABLE_SNIPPET = `
<table style="margin-bottom:25px;width:100%"><tbody><tr>
<td width="130" style="padding-right:20px; vertical-align:top;width:130px">
<a href="/success-story/33" style="text-decoration:none; color:inherit;">link</a>
</td></tr></tbody></table>
`;

const SCRIPT_SNIPPET = `<p>body</p><script type="application/ld+json">{"@type":"LegalService"}</script>`;

function assertStylePresent(html: string, property: string, value: string, label: string): void {
  const compact = `${property}:${value}`;
  const spaced = `${property}: ${value}`;
  if (!html.includes(compact) && !html.includes(spaced)) {
    throw new Error(`FAIL ${label}: expected ${compact}`);
  }
  console.log(`OK ${label}`);
}

function assertNotContains(html: string, needle: string, label: string): void {
  if (html.includes(needle)) {
    throw new Error(`FAIL ${label}: should not include "${needle}"`);
  }
  console.log(`OK ${label}`);
}

const cta = sanitizeLegacyBoardHtml(CTA_SNIPPET);
const ctaViaContentSave = sanitizeContentForSave(CTA_SNIPPET);
assertStylePresent(ctaViaContentSave, 'border-radius', '50px', 'sanitizeContentForSave keeps border-radius');
assertStylePresent(cta, 'margin', '60px 0', 'CTA outer margin shorthand');
assertStylePresent(cta, 'margin', '0 auto', 'CTA button centering');
assertStylePresent(cta, 'line-height', '54px', 'CTA button line-height');
assertStylePresent(cta, 'height', '15px', 'CTA spacer height');

const table = sanitizeLegacyBoardHtml(TABLE_SNIPPET);
assertStylePresent(table, 'vertical-align', 'top', 'table cell vertical-align');
assertStylePresent(table, 'width', '130px', 'table cell width style');
assertStylePresent(table, 'color', 'inherit', 'link color inherit');

const script = sanitizeLegacyBoardHtml(SCRIPT_SNIPPET);
assertNotContains(script, 'application/ld+json', 'script JSON-LD removed');
assertNotContains(script, '<script', 'script tag removed');
if (!script.includes('body')) {
  throw new Error('FAIL body content kept: expected paragraph text');
}
console.log('OK body content kept');

console.log('\nAll legacy sanitizer checks passed.');
