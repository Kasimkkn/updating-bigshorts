"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import logo from '@/assets/logo.svg';

interface AuthGuardProps {
    children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = () => {
            const storedUser = localStorage.getItem('userId');
            let isLoggedIn = false;

            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    isLoggedIn = !!parsed?.data;
                } catch (e) {
                    console.error('Failed to parse userId:', e);
                    localStorage.removeItem('userId');
                }
            }

            if (pathname === '/') {
                if (isLoggedIn) {
                    router.replace("/home");
                } else {
                    router.replace("/home/snips");
                }
                return;
            }

            if (isLoggedIn) {
                setIsLoading(false);
            } else {
                const isAllowedRoute =
                    pathname === '/home/snips' ||
                    (pathname?.startsWith('/auth/') &&
                        !pathname?.startsWith('/auth/change-password') &&
                        !pathname?.startsWith('/auth/change-known-password'));

                if (pathname === '/home' || (pathname?.startsWith('/home/') && pathname !== '/home/snips')) {
                    router.replace("/auth/login");
                    return;
                }

                if (!isAllowedRoute) {
                    router.replace("/home/snips");
                    return;
                }

                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            checkAuthentication();
        }, 100);

        return () => clearTimeout(timer);
    }, [router, pathname]);


    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center w-screen">
                <div className="text-center">
                    <img
                        src={logo.src}
                        alt="Logo"
                        className="w-40 h-40 animate-slow-grow mx-auto mb-4"
                    />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
