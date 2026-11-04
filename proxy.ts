import { NextResponse, type NextRequest } from 'next/server';
import { negotiate } from '@/i18n/negotiate';

export function proxy(request: NextRequest) {
  const locale = negotiate(request.headers.get('accept-language'));
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  response.headers.set('Vary', 'Accept-Language');
  return response;
}

export const config = { matcher: '/' };
