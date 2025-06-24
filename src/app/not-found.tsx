"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

const NotFoundPage = () => {
    const router = useRouter();
    const [seconds, setSeconds] = useState(10); // Start from 10

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev === 1) {
                    clearInterval(interval); // stop at 1 because we'll redirect at 0
                }
                return prev - 1;
            });
        }, 1000);

        const timeout = setTimeout(() => {
            router.push("/");
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-5xl font-bold text-text-color mb-4">404</h1>
            <p className="text-xl mb-6 text-primary-text-color">
                Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <div className="flex gap-4">
                <Button isLinearBtn={true} onClick={() => router.push("/")}>
                    Go to Homepage
                </Button>
            </div>
            <p className="mt-6 text-sm text-text-color">
                You&apos;ll be redirected to the homepage in{" "}
                <strong>{seconds} second{seconds !== 1 && "s"}</strong>...
            </p>
        </div>
    );
};

export default NotFoundPage;
