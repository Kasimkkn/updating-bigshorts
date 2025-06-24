import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { CreationOptionProvider } from "@/context/useCreationOption";
import { SearchProvider } from '@/context/SearchContext';
import { ProgressBarProvider } from "@/context/ProgressBarContext";
import { UserProfileProvider } from "@/context/useUserProfile";
import AuthGuard from "@/context/AuthGuard";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bigshorts - Social Media",
  description: "A Social Media Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <body className={inter.className}>
        <svg width="0" height="0">
          <linearGradient id="linear-gradient-svg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop stopColor="#15e8fa" offset="0%" />
            <stop stopColor="#6093ee" offset="25%" />
            <stop stopColor="#8969ea" offset="50%" />
            <stop stopColor="#bc2fde" offset="75%" />
            <stop stopColor="#d555b1" offset="100%" />
          </linearGradient>
        </svg>
        <ProgressBarProvider>
          <ThemeProvider>
            <AuthGuard>
              <CreationOptionProvider>
                <SearchProvider>
                  <UserProfileProvider>
                    {children}
                  </UserProfileProvider>
                </SearchProvider>
              </CreationOptionProvider>
            </AuthGuard>
          </ThemeProvider>
          <Toaster position="top-center" />
        </ProgressBarProvider>
        {/* <div id="modal-root" /> */}
      </body>
    </html>
  );
}