import QRCode from "qrcode";
import type {
  ErrorCorrectionLevel,
  QRFormValues,
  QRSettings,
  QRType,
} from "@/types/qr";

export function getQRContent(type: QRType, values: QRFormValues): string {
  switch (type) {
    case "URL": {
      const input = values.content.trim();
      if (!input) throw new Error("Enter a website address to create your QR code.");
      const hasProtocol = /^https?:\/\//i.test(input);
      const normalized = hasProtocol ? input : `https://${input}`;
      let url: URL;
      try {
        url = new URL(normalized);
      } catch {
        throw new Error("Enter a valid website address, such as example.com.");
      }

      if (
        !["http:", "https:"].includes(url.protocol) ||
        (!url.hostname.includes(".") && url.hostname !== "localhost")
      ) {
        throw new Error("Enter a valid website address, such as example.com.");
      }

      return hasProtocol ? input : normalized;
    }
    case "Text": {
      const text = values.content.trim();
      if (!text) throw new Error("Enter some text to create your QR code.");
      return text;
    }
    case "Email": {
      const email = values.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Enter a valid email address.");
      }
      const params = new URLSearchParams();
      if (values.subject.trim()) params.set("subject", values.subject.trim());
      if (values.message.trim()) params.set("body", values.message.trim());
      const query = params.toString();
      return `mailto:${email}${query ? `?${query}` : ""}`;
    }
    case "Phone": {
      const phone = values.phone.trim();
      if (!/^\+?[\d\s().-]{7,20}$/.test(phone)) {
        throw new Error("Enter a valid phone number.");
      }
      return `tel:${phone.replace(/[\s().-]/g, "")}`;
    }
    case "WhatsApp": {
      const phone = values.phone.replace(/\D/g, "");
      if (phone.length < 7 || phone.length > 15) {
        throw new Error("Enter a valid phone number with country code.");
      }
      const message = values.message.trim();
      return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    }
    case "Wi-Fi": {
      const name = values.wifiName.trim();
      if (!name) throw new Error("Enter your Wi-Fi network name.");
      if (values.wifiSecurity !== "nopass" && !values.wifiPassword) {
        throw new Error("Enter your Wi-Fi password.");
      }
      const escape = (value: string) => value.replace(/([\\;,":])/g, "\\$1");
      const password =
        values.wifiSecurity === "nopass" ? "" : `P:${escape(values.wifiPassword)};`;
      return `WIFI:T:${values.wifiSecurity};S:${escape(name)};${password};`;
    }
    case "vCard": {
      const name = values.vcardName.trim();
      if (!name) throw new Error("Enter a name for this contact.");
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`];
      if (values.organization.trim()) lines.push(`ORG:${values.organization.trim()}`);
      if (values.phone.trim()) lines.push(`TEL:${values.phone.trim()}`);
      if (values.email.trim()) lines.push(`EMAIL:${values.email.trim()}`);
      if (values.website.trim()) lines.push(`URL:${values.website.trim()}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    }
  }
}

export function createQRDataUrl(content: string, settings: QRSettings) {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: settings.errorCorrection as ErrorCorrectionLevel,
    margin: settings.margin,
    width: settings.size,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  });
}

export function createQRSvg(content: string, settings: QRSettings) {
  return QRCode.toString(content, {
    type: "svg",
    errorCorrectionLevel: settings.errorCorrection,
    margin: settings.margin,
    width: settings.size,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  });
}
