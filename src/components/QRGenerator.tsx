"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  createQRDataUrl,
  createQRSvg,
  getQRContent,
} from "@/lib/qr";
import {
  defaultQRFormValues,
  defaultQRSettings,
  qrTypes,
  type QRFormValues,
  type QRSettings,
  type QRType,
} from "@/types/qr";

const typeDescriptions: Record<QRType, string> = {
  URL: "Link to any website",
  Text: "Share a plain text message",
  Email: "Open a pre-filled email",
  Phone: "Start a phone call",
  WhatsApp: "Open a WhatsApp chat",
  "Wi-Fi": "Share network access",
  vCard: "Share a contact card",
};

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
}: FieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true" className="required-mark"> *</span>}
      </label>
      <input
        id={id}
        className="text-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="text-input text-area"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export default function QRGenerator() {
  const [type, setType] = useState<QRType>("URL");
  const [values, setValues] = useState<QRFormValues>(defaultQRFormValues);
  const [settings, setSettings] = useState<QRSettings>(defaultQRSettings);
  const [activeContent, setActiveContent] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationRequest, setGenerationRequest] = useState(0);
  const generationId = useRef(0);

  const updateValue = (key: keyof QRFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateSetting = <Key extends keyof QRSettings>(
    key: Key,
    value: QRSettings[Key],
  ) => {
    if (activeContent) setIsGenerating(true);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setActionMessage("");
    try {
      const content = getQRContent(type, values);
      setIsGenerating(true);
      setActiveContent(content);
      setGenerationRequest((request) => request + 1);
    } catch (generationError) {
      setPreview("");
      setActiveContent("");
      setIsGenerating(false);
      setError(
        generationError instanceof Error
          ? generationError.message
          : "We couldn't create that QR code. Check your information and try again.",
      );
    }
  };

  useEffect(() => {
    if (!activeContent) return;

    let cancelled = false;
    const currentId = ++generationId.current;
    createQRDataUrl(activeContent, settings)
      .then((dataUrl) => {
        if (!cancelled && currentId === generationId.current) {
          setPreview(dataUrl);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled && currentId === generationId.current) {
          setPreview("");
          setError("We couldn't create that QR code. Try shorter content or a different setting.");
        }
      })
      .finally(() => {
        if (!cancelled && currentId === generationId.current) {
          setIsGenerating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeContent, generationRequest, settings]);

  const handleReset = () => {
    generationId.current += 1;
    setType("URL");
    setValues(defaultQRFormValues);
    setSettings(defaultQRSettings);
    setActiveContent("");
    setPreview("");
    setError("");
    setActionMessage("");
    setIsGenerating(false);
  };

  const handleCopyContent = async () => {
    if (!activeContent) {
      setActionMessage("Generate a QR code before copying its content.");
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setActionMessage("Clipboard access isn't available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(activeContent);
      setActionMessage("Content copied to clipboard.");
    } catch {
      setActionMessage("Couldn't access the clipboard. Check your browser permissions.");
    }
  };

  const handleCopyQR = async () => {
    if (!activeContent || !preview) {
      setActionMessage("Generate a QR code before copying it.");
      return;
    }
    if (!navigator.clipboard?.write || !("ClipboardItem" in window)) {
      setActionMessage("Image copy isn't supported here. Try downloading the PNG instead.");
      return;
    }
    try {
      const response = await fetch(preview);
      const image = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [image.type]: image }),
      ]);
      setActionMessage("QR code copied to clipboard.");
    } catch {
      setActionMessage("Couldn't copy the image. Try downloading the PNG instead.");
    }
  };

  const handleDownloadPng = () => {
    if (!preview) {
      setActionMessage("Generate a QR code before downloading.");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = preview;
      link.download = "qrforge-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActionMessage("PNG download started.");
    } catch {
      setActionMessage("Couldn't download the PNG. Please try again.");
    }
  };

  const handleDownloadSvg = async () => {
    if (!activeContent) {
      setActionMessage("Generate a QR code before downloading.");
      return;
    }
    try {
      const svg = await createQRSvg(activeContent, settings);
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrforge-code.svg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionMessage("SVG download started.");
    } catch {
      setActionMessage("Couldn't download the SVG. Please try again.");
    }
  };

  const changeColor = (
    key: "foreground" | "background",
    event: ChangeEvent<HTMLInputElement>,
  ) => updateSetting(key, event.target.value);

  const renderFields = () => {
    switch (type) {
      case "URL":
      case "Text":
        return type === "URL" ? (
          <Field
            id="qr-content"
            label="Website URL"
            value={values.content}
            onChange={(value) => updateValue("content", value)}
            placeholder="https://example.com"
            required
            hint="We’ll add https:// if you leave it out."
          />
        ) : (
          <TextArea
            id="qr-content"
            label="Your text"
            value={values.content}
            onChange={(value) => updateValue("content", value)}
            placeholder="Type a message to share..."
          />
        );
      case "Email":
        return (
          <>
            <Field id="email-address" label="Email address" value={values.email} onChange={(value) => updateValue("email", value)} placeholder="hello@example.com" type="email" required />
            <Field id="email-subject" label="Subject (optional)" value={values.subject} onChange={(value) => updateValue("subject", value)} placeholder="A quick hello" />
            <TextArea id="email-message" label="Message (optional)" value={values.message} onChange={(value) => updateValue("message", value)} placeholder="Write a message..." />
          </>
        );
      case "Phone":
        return <Field id="phone-number" label="Phone number" value={values.phone} onChange={(value) => updateValue("phone", value)} placeholder="+1 555 123 4567" type="tel" required />;
      case "WhatsApp":
        return (
          <>
            <Field id="whatsapp-number" label="Phone number" value={values.phone} onChange={(value) => updateValue("phone", value)} placeholder="15551234567" type="tel" required hint="Include your country code, without the + sign." />
            <TextArea id="whatsapp-message" label="Pre-filled message (optional)" value={values.message} onChange={(value) => updateValue("message", value)} placeholder="Hi! I found you on..." />
          </>
        );
      case "Wi-Fi":
        return (
          <>
            <Field id="wifi-name" label="Network name (SSID)" value={values.wifiName} onChange={(value) => updateValue("wifiName", value)} placeholder="Your network name" required />
            <div className="field">
              <label className="field-label" htmlFor="wifi-security">Security</label>
              <select id="wifi-security" className="text-input" value={values.wifiSecurity} onChange={(event) => updateValue("wifiSecurity", event.target.value as QRFormValues["wifiSecurity"])}>
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </select>
            </div>
            {values.wifiSecurity !== "nopass" && (
              <Field id="wifi-password" label="Password" value={values.wifiPassword} onChange={(value) => updateValue("wifiPassword", value)} placeholder="Network password" type="password" required />
            )}
          </>
        );
      case "vCard":
        return (
          <>
            <Field id="contact-name" label="Full name" value={values.vcardName} onChange={(value) => updateValue("vcardName", value)} placeholder="Alex Morgan" required />
            <Field id="contact-phone" label="Phone (optional)" value={values.phone} onChange={(value) => updateValue("phone", value)} placeholder="+1 555 123 4567" type="tel" />
            <Field id="contact-email" label="Email (optional)" value={values.email} onChange={(value) => updateValue("email", value)} placeholder="alex@example.com" type="email" />
            <Field id="contact-organization" label="Organization (optional)" value={values.organization} onChange={(value) => updateValue("organization", value)} placeholder="Company name" />
            <Field id="contact-website" label="Website (optional)" value={values.website} onChange={(value) => updateValue("website", value)} placeholder="https://example.com" />
          </>
        );
    }
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="QRForge home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>QR<span className="brand-accent">Forge</span></span>
        </Link>
        <span className="header-note"><span className="status-dot" /> Free forever · No signup</span>
      </header>

      <section className="intro">
        <div className="eyebrow"><span className="eyebrow-line" /> SIMPLE. PRIVATE. YOURS.</div>
        <h1>Your ideas,<br className="mobile-break" /> <span>in a scan.</span></h1>
        <p>Create unlimited QR codes instantly. No signup required.</p>
      </section>

      <section className="workspace" aria-label="QR code generator">
        <form className="editor-card" onSubmit={handleGenerate}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">CREATE YOUR CODE</p>
              <h2>What would you like to share?</h2>
            </div>
            <button type="button" className="reset-button" onClick={handleReset}>
              <Icon><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></Icon>
              Reset
            </button>
          </div>

          <div className="type-tabs" role="group" aria-label="QR code content type">
            {qrTypes.map((tab) => (
              <button
                type="button"
                key={tab}
                className={`type-tab${type === tab ? " selected" : ""}`}
                aria-pressed={type === tab}
                title={typeDescriptions[tab]}
                onClick={() => {
                  setType(tab);
                  generationId.current += 1;
                  setActiveContent("");
                  setPreview("");
                  setIsGenerating(false);
                  setError("");
                  setActionMessage("");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="input-fields">{renderFields()}</div>

          <div className="section-divider" />
          <div className="settings-heading">
            <div>
              <p className="section-kicker">MAKE IT YOURS</p>
              <h3>Customize your code</h3>
            </div>
            <span className="optional-label">OPTIONAL</span>
          </div>

          <div className="color-row">
            <ColorControl id="foreground" label="Code color" value={settings.foreground} onChange={changeColor} />
            <ColorControl id="background" label="Background" value={settings.background} onChange={changeColor} />
          </div>

          <div className="select-row">
            <div className="field">
              <label className="field-label" htmlFor="output-size">Output size</label>
              <select id="output-size" className="text-input" value={settings.size} onChange={(event) => updateSetting("size", Number(event.target.value))}>
                <option value={512}>512 × 512 px</option>
                <option value={1024}>1024 × 1024 px</option>
                <option value={2048}>2048 × 2048 px</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="error-correction">Error correction</label>
              <select id="error-correction" className="text-input" value={settings.errorCorrection} onChange={(event) => updateSetting("errorCorrection", event.target.value as QRSettings["errorCorrection"])}>
                <option value="L">Low · 7%</option>
                <option value="M">Medium · 15%</option>
                <option value="Q">Quartile · 25%</option>
                <option value="H">High · 30%</option>
              </select>
            </div>
          </div>
          <div className="field margin-field">
            <div className="range-label">
              <label className="field-label" htmlFor="quiet-zone">Quiet zone</label>
              <span>{settings.margin} modules</span>
            </div>
            <input id="quiet-zone" className="range-input" type="range" min="0" max="8" value={settings.margin} onChange={(event) => updateSetting("margin", Number(event.target.value))} />
            <p className="field-hint">Space around the code helps scanners read it reliably.</p>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="generate-button" type="submit" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate QR code"}
            {!isGenerating && <Icon><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>}
          </button>
        </form>

        <aside className="preview-card" aria-label="QR code preview">
          <div className="preview-top">
            <div>
              <p className="section-kicker">YOUR PREVIEW</p>
              <h2>Ready to scan</h2>
            </div>
            <span className={`preview-status${preview ? " is-ready" : ""}`}>
              <span />{preview ? "READY" : "WAITING"}
            </span>
          </div>
          <div className="qr-stage">
            {preview ? (
              <div
                className="qr-image-frame"
                style={{ backgroundColor: settings.background }}
              >
                <Image
                  src={preview}
                  alt={`Generated QR code for ${type.toLowerCase()}`}
                  className="qr-image"
                  width={settings.size}
                  height={settings.size}
                  unoptimized
                />
              </div>
            ) : (
              <div className="empty-qr" aria-hidden="true">
                <div className="empty-finder finder-one"><span /></div>
                <div className="empty-finder finder-two"><span /></div>
                <div className="empty-finder finder-three"><span /></div>
                <div className="empty-dots"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              </div>
            )}
          </div>
          <p className="preview-caption">
            {preview ? "Scan it with your camera, or save it below." : "Your QR code will appear here"}
          </p>
          <div className="download-actions">
            <button className="download-button primary-download" onClick={handleDownloadPng} type="button" disabled={!preview}>
              <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Icon>
              Download PNG
            </button>
            <button className="download-button" onClick={handleDownloadSvg} type="button" disabled={!preview}>
              <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></Icon>
              Download SVG
            </button>
          </div>
          <div className="copy-actions">
            <button className="text-action" type="button" onClick={handleCopyQR} disabled={!preview}>Copy QR</button>
            <span aria-hidden="true">·</span>
            <button className="text-action" type="button" onClick={handleCopyContent} disabled={!activeContent}>Copy content</button>
          </div>
          <p className="action-message" role="status" aria-live="polite">{actionMessage}</p>
          <div className="privacy-note">
            <Icon><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
            <span>Made in your browser. Your content stays yours.</span>
          </div>
        </aside>
      </section>

      <footer className="site-footer">
        <span>© 2026 QRForge · Developed by Rajmani Nadar</span>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </main>
  );
}

function ColorControl({
  id,
  label,
  value,
  onChange,
}: {
  id: "foreground" | "background";
  label: string;
  value: string;
  onChange: (key: "foreground" | "background", event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="color-control">
      <label className="field-label" htmlFor={`${id}-color`}>{label}</label>
      <div className="color-input-wrap">
        <input id={`${id}-color`} className="color-picker" type="color" value={value} onChange={(event) => onChange(id, event)} aria-label={label} />
        <span>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
