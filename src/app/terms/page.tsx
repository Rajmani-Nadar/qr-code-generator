import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Back to QRForge</Link>
      <h1>Terms</h1>
      <p>Last updated October 2026</p>
      <p>
        QRForge is a free browser-based tool for creating static QR codes. You
        can use it without an account and generate as many codes as your device
        can handle.
      </p>
      <h2>Your responsibility</h2>
      <p>
        Check that your QR code contains the correct information before
        sharing or printing it. QRForge is provided as-is, without a guarantee
        that every scanner or device will work identically.
      </p>
      <h2>Use of the service</h2>
      <p>
        Do not use QRForge to distribute unlawful or harmful content. You are
        responsible for the content you choose to encode and share.
      </p>
    </main>
  );
}
