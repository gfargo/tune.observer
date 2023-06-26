import "server-only";
import React from "react";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";

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
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head></head>
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
