'use client';

import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState,} from 'react';
import {useRouter} from 'next/navigation';

interface User {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    // optional weitere Felder
}

type AuthStatus = 'initial' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
    user: User | null;
    status: AuthStatus;
    isLoading: boolean; // initial fetch
    isAuthenticating: boolean; // login/logout in progress
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    revalidateUser: () => Promise<void>;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export function AuthProvider({
                                 children,
                                 initialUser, // optional: falls du serverseitig initialen user übergibst
                             }: {
    children: ReactNode;
    // Optional: falls du im Layout per server-side session den User liest und weitergibst
    initialUser?: User | null;
}) {
    const router = useRouter();

    // State
    const [user, setUser] = useState<User | null>(() => initialUser ?? null);
    const [status, setStatus] = useState<AuthStatus>(() =>
        initialUser ? 'authenticated' : 'initial'
    );
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // refs for abort + stale-response prevention
    const activeRequestId = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    const isLoading = status === 'initial';
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        mountedRef.current = true;
        // only fetch if no initialUser
        if (status === 'initial' && !initialUser) {
            revalidateUser().catch(() => {
                /* handled in revalidateUser */
            });
        }
        return () => {
            mountedRef.current = false;
            abortControllerRef.current?.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty: run once on mount

    // Helper: generic fetch wrapper with credentials and abort support
    const safeFetch = useCallback(
        async (input: RequestInfo, init: RequestInit = {}) => {
            // cancel previous fetch for user revalidation (if any)
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            const safeInit: RequestInit = {
                ...init,
                credentials: 'include', // ensure cookies (httpOnly) are sent
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init.headers || {}),
                },
                // no caching for auth endpoints
                cache: 'no-store',
            };

            return await fetch(input, safeInit);
        },
        []
    );

    // Revalidate / Fetch current user
    const revalidateUser = useCallback(async () => {
        const requestId = ++activeRequestId.current;
        setError(null);
        // mark as loading only if we were in 'initial' or 'unauthenticated'
        if (status === 'initial') setStatus('loading');

        try {
            const res = await safeFetch('/api/auth/me', { method: 'GET' });
            if (!mountedRef.current) return;

            if (!res.ok) {
                // Not authenticated or error
                // If a 401 from server: treat as unauthenticated
                setUser(null);
                setStatus('unauthenticated');
                return;
            }

            const payload = await res.json();
            // ignore stale responses
            if (requestId !== activeRequestId.current) return;

            setUser(payload.user ?? null);
            setStatus(payload.user ? 'authenticated' : 'unauthenticated');
        } catch (err) {
            if (!mountedRef.current) return;
            // Abort is expected when navigating away - don't surface as an error

            if (err instanceof Error && err.name === 'AbortError') return;            console.error('revalidateUser error:', err);
            setUser(null);
            setStatus('unauthenticated');
            setError('Unable to verify session');
        }
    }, [safeFetch, status]);

    // Login
    const login = useCallback(
        async (email: string, password: string) => {
            setIsAuthenticating(true);
            setError(null);
            try {
                const res = await safeFetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    const message = body?.message || `Login failed (${res.status})`;
                    throw new Error(message);
                }

                // Depending on your API: it might return the user or just set cookies.
                // To be robust, revalidate the user from /api/auth/me
                await revalidateUser();

                if (!mountedRef.current) throw new Error('Component unmounted');

                if (!isAuthenticated && user === null) {
                    // if still unauthenticated after revalidation → throw
                    throw new Error('Login succeeded but session not established');
                }

                // navigate to the dashboard (replace to avoid extra history entry)
                router.replace('/dashboard');
                // revalidate server components if needed
                router.refresh();

                // return user for immediate usage
                if (!mountedRef.current) throw new Error('Component unmounted');
                if (!user) {
                    // return the latest user from state
                    return (await (await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })).json()).user;
                }
                return user;
            } catch (err) {
                if (!mountedRef.current) throw err;
                const message = err instanceof Error ? err.message : 'Login error';
                setError(message);
                throw err;
            } finally {
                if (mountedRef.current) setIsAuthenticating(false);
            }
        },
        [safeFetch, revalidateUser, router, isAuthenticated, user]
    );

    // Logout
    const logout = useCallback(async () => {
        setIsAuthenticating(true);
        setError(null);
        try {
            const res = await safeFetch('/api/auth/logout', { method: 'POST' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || `Logout failed (${res.status})`);
            }

            // Clear client state & navigate
            setUser(null);
            setStatus('unauthenticated');
            router.replace('/login');
            router.refresh();
        } catch (err) {
            if (!mountedRef.current) throw err;
            const message = err instanceof Error ? err.message : 'Logout error';
            setError(message);
            console.error('Logout failed:', message);
            throw err;
        } finally {
            if (mountedRef.current) setIsAuthenticating(false);
        }
    }, [safeFetch, router]);

    const hasRole = useCallback(
        (role: string) => {
            if (!user) return false;
            const roles = (user.role || '').split(',').map(r => r.trim());
            return roles.includes(role);
        },
        [user]
    );

    const ctxValue = useMemo(
        () => ({
            user,
            status,
            isLoading,
            isAuthenticating,
            error,
            isAuthenticated,
            login,
            logout,
            revalidateUser,
            hasRole,
        }),
        [user, status, isLoading, isAuthenticating, error, isAuthenticated, login, logout, revalidateUser, hasRole]
    );

    return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
}
