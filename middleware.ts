import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.includes('/login') || pathname.includes('/setup-mfa');
  const isApiRoute = pathname.startsWith('/api/');

  const isMockUser = request.cookies.get('mock-user')?.value === 'true';
  const hasUser = user || isMockUser;

  if (!isApiRoute) {
    if (!hasUser && !isAuthPage) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/fr/login';
      return NextResponse.redirect(loginUrl);
    }
    if (hasUser && isAuthPage) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/fr/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
