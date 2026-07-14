import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/usta')) {
    const isProvider = request.cookies.get('is_provider')?.value;

    if (isProvider !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/profil';
      url.searchParams.set('usta_ol', '1');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/usta/:path*'],
};