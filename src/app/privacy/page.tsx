import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/">← Back to QRForge</Link>
      <h1>Privacy</h1>
      <p>Last updated October 2026</p>
      <p>
        QRForge creates QR codes in your browser. The content you enter is not
        sent to our servers, stored by us, or shared with a QR-generation
        service.
      </p>
      <h2>Information and storage</h2>
      <p>
        QRForge does not ask for an account, collect personal information, or
        save the content you enter. Your browser may keep a downloaded file or
        clipboard item only when you choose those actions.
      </p>
      <h2>Questions</h2>
      <p>
        This simple privacy notice describes the current QRForge generator.
        There are no analytics or advertising trackers in the app.
      </p>
    </main>
  );
}
