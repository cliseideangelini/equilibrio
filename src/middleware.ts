import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção da Área Clínica (Psicóloga)
  if (pathname.startsWith('/area-clinica')) {
    const adminId = request.cookies.get('admin_id')?.value;
    if (!adminId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteção do Painel do Paciente
  if (pathname.startsWith('/paciente') && !pathname.startsWith('/paciente/login') && !pathname.startsWith('/paciente/cadastro')) {
    const patientId = request.cookies.get('patient_id')?.value;
    if (!patientId) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/area-clinica/:path*', '/paciente/:path*'],
};
