type BoardJsonLdProps = {
  wrId: number;
  schema: string | Record<string, unknown>;
};

function toSafeJsonLd(schema: string | Record<string, unknown>): string | null {
  try {
    const data = typeof schema === 'string' ? JSON.parse(schema) : schema;

    // HTML 파서가 JSON 문자열 안의 닫는 script 태그를 실제 태그로 해석하지 못하게 한다.
    return JSON.stringify(data).replace(/</g, '\\u003c');
  } catch {
    return null;
  }
}

export default function BoardJsonLd({ wrId, schema }: BoardJsonLdProps) {
  const safeJson = toSafeJsonLd(schema);
  if (safeJson === null) return null;

  return (
    <script id={`board-schema-${wrId}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson }} />
  );
}
