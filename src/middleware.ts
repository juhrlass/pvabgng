import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {jwtVerify} from 'jose';

// === Route-Konfiguration zentralisiert ===
const routesConfig = {
    protected: [
        '/dashboard',
        '/profile',
        '/api/protected',
        '/api/auth/me',
        '/api/auth/logout',
    ],
    guestOnly: [
        '/login',
        '/signup',
        '/api/auth/login',
    ],
};

// === JWT Secret Handling ===
function getJWTSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is missing in production!');
        }
        return 'dev_secret_key';
    }
    return secret;
}

// === Token-Verifizierung ===
async function verifyToken(token: string): Promise<boolean> {
    try {
        const {payload} = await jwtVerify(
            token,
            new TextEncoder().encode(getJWTSecret())
        );

        // Optionale zusätzliche Checks
        if (!payload.sub) return false; // Muss z.B. User-ID haben
        if (payload.exp && Date.now() >= payload.exp * 1000) return false; // Abgelaufen

        return true;
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('JWT verification failed:', err instanceof Error ? err.message : err);
        }
        return false;
    }
}

// === Middleware ===
export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const isProtectedRoute = routesConfig.protected.some(route =>
        pathname.startsWith(route)
    );
    const isGuestOnlyRoute = routesConfig.guestOnly.some(route =>
        pathname.startsWith(route)
    );

    // Falls keine Auth-Logik nötig → durchlassen
    if (!isProtectedRoute && !isGuestOnlyRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    const isAuthenticated = token ? await verifyToken(token) : false;

    // Authentifizierte User sollen nicht auf Guest-Only-Seiten
    if (isGuestOnlyRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Nicht-authentifizierte User sollen nicht auf Protected-Seiten
    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard',
        '/profile',
        '/api/protected',
        '/api/auth',
        '/login',
        '/signup',
    ],
};
