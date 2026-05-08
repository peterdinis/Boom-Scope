import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const ralewayHeading = Raleway({subsets:['latin'],variable:'--font-heading'});

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boom Scope",
  description: "Boom Scope app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable, ralewayHeading.variable)}
      >
        <body className="min-h-full flex flex-col">
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
