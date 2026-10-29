import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free QR Code Generator — Create Unlimited QR Codes",
  description:
    "Create unlimited free QR codes instantly. Generate QR codes for URLs and text, customize them, and download them as PNG or SVG. No signup required.",
  openGraph: {
    title: "Free QR Code Generator — QRForge",
    description:
      "Create unlimited free QR codes instantly. Customize and download in seconds. No signup required.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
