import Script from 'next/script';

type BoardJsonLdProps = {
  wrId: number;
  schema: string;
};

function toSafeJsonLd(schema: string): string | null {
  const trimmed = schema.trim();
  if (trimmed === '') return null;

  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

export default function BoardJsonLd({ wrId, schema }: BoardJsonLdProps) {
  const safeJson = toSafeJsonLd(schema);
  if (safeJson === null) return null;

  return (
    <Script
      id={`board-schema-${wrId}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
