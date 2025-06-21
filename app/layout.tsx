import type { Metadata } from "next";
import { Lexend_Giga } from "next/font/google";
import "./globals.css";

const lexendGiga = Lexend_Giga({
  variable: "--font-lexend-giga",
  subsets: ["latin"],
  weight: ["400"],
});


export const metadata: Metadata = {
  title: "Higher or Lower Cities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexendGiga.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
