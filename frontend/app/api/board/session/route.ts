import { NextResponse } from 'next/server';

const CAFE24_SESSION_API = 'https://lawfirmonly1.mycafe24.com/api/board/get_session.php';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  const upstreamUrl = query ? `${CAFE24_SESSION_API}?${query}` : CAFE24_SESSION_API;

  const upstream = await fetch(upstreamUrl, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { is_admin: '', mb_name: null, write_href: null, update_href: null, delete_href: null },
      { status: upstream.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const data = await upstream.json();
  const response = NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });

  upstream.headers.getSetCookie().forEach(cookie => {
    response.headers.append('set-cookie', cookie);
  });

  return response;
}
