import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "gd_session";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Só intercepta rotas /admin
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Página de login é pública, mas se já estiver autenticado redireciona para o admin
  if (path === "/admin/login") {
    const token = request.cookies.get(COOKIE)?.value;
    const key = secret();
    if (token && key) {
      try {
        await jwtVerify(token, key);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // Token inválido, prossegue para a tela de login
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const key = secret();
  if (key) {
    try {
      await jwtVerify(token, key);
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
