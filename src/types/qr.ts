export const qrTypes = [
  "URL",
  "Text",
  "Email",
  "Phone",
  "WhatsApp",
  "Wi-Fi",
  "vCard",
] as const;

export type QRType = (typeof qrTypes)[number];
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type WifiSecurity = "WPA" | "WEP" | "nopass";
export type QRFrame =
  | "none"
  | "simple"
  | "rounded"
  | "scan-me"
  | "scan-here"
  | "scan-to-visit"
  | "point-camera-here"
  | "scan-now"
  | "dark"
  | "minimal";

export type QRFrameSettings = {
  style: QRFrame;
  text: string;
  color: string;
  textColor: string;
};

export const qrFrameOptions: {
  id: QRFrame;
  label: string;
  defaultText: string;
  treatment: "none" | "simple" | "rounded" | "cta" | "dark" | "minimal";
}[] = [
  { id: "none", label: "None", defaultText: "", treatment: "none" },
  { id: "simple", label: "Simple", defaultText: "", treatment: "simple" },
  { id: "rounded", label: "Rounded", defaultText: "", treatment: "rounded" },
  { id: "scan-me", label: "Scan Me", defaultText: "SCAN ME", treatment: "cta" },
  { id: "scan-here", label: "Scan Here", defaultText: "SCAN HERE", treatment: "cta" },
  { id: "scan-to-visit", label: "Scan to Visit", defaultText: "SCAN TO VISIT", treatment: "cta" },
  { id: "point-camera-here", label: "Point Camera Here", defaultText: "POINT CAMERA HERE", treatment: "cta" },
  { id: "scan-now", label: "Scan Now", defaultText: "SCAN NOW", treatment: "cta" },
  { id: "dark", label: "Dark", defaultText: "", treatment: "dark" },
  { id: "minimal", label: "Minimal", defaultText: "SCAN", treatment: "minimal" },
];

export type QRSettings = {
  foreground: string;
  background: string;
  size: number;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
};

export type QRFormValues = {
  content: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  wifiName: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  vcardName: string;
  organization: string;
  website: string;
};

export const defaultQRSettings: QRSettings = {
  foreground: "#000000",
  background: "#ffffff",
  size: 1024,
  margin: 4,
  errorCorrection: "M",
};

export const defaultQRFrameSettings: QRFrameSettings = {
  style: "none",
  text: "",
  color: "#000000",
  textColor: "#000000",
};

export const defaultQRFormValues: QRFormValues = {
  content: "",
  email: "",
  subject: "",
  message: "",
  phone: "",
  wifiName: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  vcardName: "",
  organization: "",
  website: "",
};
