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
