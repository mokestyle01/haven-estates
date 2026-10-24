import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";
import "leaflet/dist/leaflet.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `${BRAND.name} | Property guidance in ${BRAND.state}`, template: `%s | ${BRAND.name}` },
  description: `Thoughtful property guidance in ${BRAND.serviceArea}. Explore illustrative listings and speak with our property consultants.`,
  openGraph: { title: BRAND.name, description: `Property guidance in ${BRAND.serviceArea}.`, type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG"><body><Header />{children}<Footer /></body></html>;
}
