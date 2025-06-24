"use client";
import logo from '@/assets/logo.svg';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
const MainPage = () => {
    const router = useRouter();
    useEffect(() => {
        router.replace("/home/snips");
    }, [router]);
    return (
        <div className="h-screen flex items-center justify-center w-screen">
            <img
                src={logo.src}
                alt="Logo"
                className="w-40 h-40 animate-slow-grow"
            />
        </div>
    );

};

export default MainPage;
