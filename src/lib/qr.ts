import QRCode from "qrcode";
import { qrFrameOptions } from "@/types/qr";
import type {
  ErrorCorrectionLevel,
  QRFrameSettings,
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

export function createQRDataUrl(
  content: string,
  settings: QRSettings,
  width = settings.size,
) {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: settings.errorCorrection as ErrorCorrectionLevel,
    margin: settings.margin,
    width,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  });
}

export function createQRSvg(
  content: string,
  settings: QRSettings,
  width = settings.size,
) {
  return QRCode.toString(content, {
    type: "svg",
    errorCorrectionLevel: settings.errorCorrection,
    margin: settings.margin,
    width,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  });
}

type FrameLayout = {
  qrSize: number;
  qrX: number;
  qrY: number;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  cornerRadius: number;
  treatment: (typeof qrFrameOptions)[number]["treatment"];
};

function getFrameLayout(size: number, frame: QRFrameSettings): FrameLayout {
  const option = qrFrameOptions.find(({ id }) => id === frame.style);
  if (!option) throw new Error("Choose a supported frame style.");

  if (option.treatment === "none") {
    return {
      qrSize: size,
      qrX: 0,
      qrY: 0,
      frameX: 0,
      frameY: 0,
      frameWidth: size,
      frameHeight: size,
      cornerRadius: 0,
      treatment: option.treatment,
    };
  }

  const qrSize = Math.round(
    size *
      (option.treatment === "cta"
        ? 0.64
        : option.treatment === "minimal"
          ? 0.67
          : option.treatment === "dark"
            ? 0.68
            : 0.74),
  );
  const qrX = Math.round((size - qrSize) / 2);
  const qrY =
    option.treatment === "cta" || option.treatment === "minimal"
      ? Math.round(size * 0.12)
      : Math.round((size - qrSize) / 2);
  const gap = Math.round(size * 0.045);
  const frameX = qrX - gap;
  const frameY = qrY - gap;
  const frameWidth = qrSize + gap * 2;
  const frameHeight =
    option.treatment === "cta" || option.treatment === "minimal"
      ? Math.round(size * 0.78)
      : frameWidth;

  return {
    qrSize,
    qrX,
    qrY,
    frameX,
    frameY,
    frameWidth,
    frameHeight,
    cornerRadius: option.treatment === "rounded" ? Math.round(size * 0.045) : 0,
    treatment: option.treatment,
  };
}

function getFrameLabel(frame: QRFrameSettings) {
  return frame.text.trim();
}

function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

export async function createQRPreviewDataUrl(
  content: string,
  settings: QRSettings,
  frame: QRFrameSettings,
) {
  if (frame.style === "none") return createQRDataUrl(content, settings);

  const layout = getFrameLayout(settings.size, frame);
  const qrDataUrl = await createQRDataUrl(content, settings, layout.qrSize);
  const qrImage = new Image();
  const imageLoaded = new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = () => reject(new Error("Couldn't prepare the QR image."));
  });
  qrImage.src = qrDataUrl;
  await imageLoaded;

  const canvas = document.createElement("canvas");
  canvas.width = settings.size;
  canvas.height = settings.size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.fillStyle = settings.background;
  context.fillRect(0, 0, settings.size, settings.size);

  if (layout.treatment === "dark") {
    context.fillStyle = frame.color;
    context.fillRect(
      Math.round(settings.size * 0.04),
      Math.round(settings.size * 0.04),
      Math.round(settings.size * 0.92),
      Math.round(settings.size * 0.92),
    );
  } else if (layout.treatment !== "minimal") {
    context.strokeStyle = frame.color;
    context.lineWidth = Math.max(2, Math.round(settings.size * 0.012));
    if (layout.cornerRadius) {
      const { frameX: x, frameY: y, frameWidth: width, frameHeight: height } = layout;
      const radius = layout.cornerRadius;
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      context.stroke();
    } else {
      context.strokeRect(
        layout.frameX,
        layout.frameY,
        layout.frameWidth,
        layout.frameHeight,
      );
    }
  }

  context.drawImage(qrImage, layout.qrX, layout.qrY, layout.qrSize, layout.qrSize);
  const label = getFrameLabel(frame);
  if (label && (layout.treatment === "cta" || layout.treatment === "minimal")) {
    context.fillStyle = frame.textColor;
    const fontSize = Math.round(
      settings.size * (layout.treatment === "minimal" ? 0.027 : 0.034),
    );
    context.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      label.toLocaleUpperCase(),
      settings.size / 2,
      Math.round(settings.size * 0.91),
      Math.round(settings.size * 0.76),
    );
  }
  return canvas.toDataURL("image/png");
}

export async function createQRFramedSvg(
  content: string,
  settings: QRSettings,
  frame: QRFrameSettings,
) {
  if (frame.style === "none") return createQRSvg(content, settings);

  const layout = getFrameLayout(settings.size, frame);
  const qrSvg = await createQRSvg(content, settings, layout.qrSize);
  const strokeWidth = Math.max(2, Math.round(settings.size * 0.012));
  const label = getFrameLabel(frame);
  const darkBackground =
    layout.treatment === "dark"
      ? `<rect x="${Math.round(settings.size * 0.04)}" y="${Math.round(settings.size * 0.04)}" width="${Math.round(settings.size * 0.92)}" height="${Math.round(settings.size * 0.92)}" fill="${frame.color}"/>`
      : "";
  const border =
    layout.treatment === "minimal" || layout.treatment === "dark"
      ? ""
      : `<rect x="${layout.frameX}" y="${layout.frameY}" width="${layout.frameWidth}" height="${layout.frameHeight}" rx="${layout.cornerRadius}" fill="none" stroke="${frame.color}" stroke-width="${strokeWidth}"/>`;
  const text =
    label && (layout.treatment === "cta" || layout.treatment === "minimal")
      ? `<text x="${settings.size / 2}" y="${Math.round(settings.size * 0.91)}" fill="${frame.textColor}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(settings.size * (layout.treatment === "minimal" ? 0.027 : 0.034))}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(label.toLocaleUpperCase())}</text>`
      : "";
  const minimalLine =
    layout.treatment === "minimal"
      ? `<path d="M ${Math.round(settings.size * 0.34)} ${Math.round(settings.size * 0.865)} H ${Math.round(settings.size * 0.66)}" stroke="${frame.color}" stroke-width="${strokeWidth}"/>`
      : "";
  const qrContentStart = qrSvg.indexOf(">") + 1;
  const qrContentEnd = qrSvg.lastIndexOf("</svg>");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size}" height="${settings.size}" viewBox="0 0 ${settings.size} ${settings.size}"><rect width="${settings.size}" height="${settings.size}" fill="${settings.background}"/>${darkBackground}${border}<svg x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}" viewBox="0 0 ${layout.qrSize} ${layout.qrSize}">${qrSvg.slice(qrContentStart, qrContentEnd)}</svg>${minimalLine}${text}</svg>`;
}
