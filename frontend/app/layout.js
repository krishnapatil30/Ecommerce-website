import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/context/CartContext';
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OrderCard",
  description: "Your ultimate online shopping destination",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        {/* We wrap everything in CartProvider so the Navbar AND the pages can see the cart */}
        <CartProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}