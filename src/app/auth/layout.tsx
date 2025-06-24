"use client"
import LoginSignupBg from "@/components/authComponent/LoginSignupBg";
import React from "react";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    return (
        <section className="w-full h-screen flex overflow-hidden">
            <LoginSignupBg />
            {children}
            <Toaster position="top-center" />
        </section>

    )
}

export default Layout