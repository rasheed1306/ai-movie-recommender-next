import type { Metadata } from "next";
import { Work_Sans, Lora, Inconsolata } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/components/AuthProvider";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MovieMatch - AI Movie Recommender",
  description: "Stop arguing. Start watching. Get matched with movies you'll all love by answering 5 simple questions with friends.",
  keywords: ["movies", "recommendations", "watch party", "AI", "movie night"],
  authors: [{ name: "MovieMatch" }],
  openGraph: {
    title: "MovieMatch - AI Movie Recommender",
    description: "Stop arguing. Start watching. Get matched with movies you'll all love.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${lora.variable} ${inconsolata.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}