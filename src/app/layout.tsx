import "server-only";
import React from "react";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
// import { Toaster } from "@/components/ui/toaster";

// do not cache this layout
export const revalidate = 0;

// eslint-disable-next-line @typescript-eslint/require-await
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body>
        {children}
        {/* <Toaster /> */}
        <Analytics />
      </body>
    </html>
  );
}
