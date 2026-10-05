import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Crimson_Pro, Mulish, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { getCategories } from "@/lib/categories";
import { getCurrentCustomer } from "@/lib/customer-auth";

// Body text — clean geometric sans used on the Anjuman's new website
const sans = Mulish({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Headings — classic book serif
const serif = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-nastaliq",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maktaba Khuddam-ul-Quran — مکتبہ خدام القرآن",
  description:
    "Premium online Islamic bookstore — books by Dr. Israr Ahmed (RA), Quranic commentary, and Islamic literature with free home delivery in Pakistan.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [customer, categories, topics] = await Promise.all([
    getCurrentCustomer(),
    getCategories("category"),
    getCategories("topic"),
  ]);
  const menu = (list: typeof categories) => list.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${serif.variable} ${nastaliq.variable} flex min-h-screen flex-col antialiased`}
      >
        <StoreProvider customer={customer && { id: customer.id, name: customer.name }}>
          <Header categories={menu(categories)} topics={menu(topics)} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
