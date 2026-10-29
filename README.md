# QRForge

A free, responsive QR code generator built with Next.js, React, TypeScript, and Tailwind CSS. QR codes are generated in the browser; content is not sent to a QR service or stored by the app.

## Features

- Create QR codes for URLs, text, email, phone, WhatsApp, Wi-Fi, and vCards.
- Customize foreground/background colors, output size, quiet zone, and error correction.
- Download high-resolution PNG or vector SVG; copy the QR image or encoded content where supported.
- No account, database, QR API, or generation limits.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy to Vercel

Import this folder into Vercel, or connect its Git repository in the Vercel dashboard. The default Next.js build settings work; no environment variables, custom domain, database, or API key are needed.

## Project structure

```text
src/
  app/
    icon.svg
    page.tsx
    layout.tsx
    globals.css
    privacy/page.tsx
    terms/page.tsx
  components/
    QRGenerator.tsx
  lib/
    qr.ts
  types/
    qr.ts
```
