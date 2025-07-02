import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
    title: "ISO8583 Desktop Tool",
    description: "A desktop tool for ISO8583 message parser and validator",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Toaster />
                {children}
            </body>
        </html>
    );
}
