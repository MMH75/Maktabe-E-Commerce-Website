import type { Metadata } from "next";
import WishlistView from "@/components/WishlistView";

export const metadata: Metadata = { title: "Wishlist — Maktaba Khuddam-ul-Quran" };

export default function WishlistPage() {
  return <WishlistView />;
}
