// Root layout — wraps every page.
//
// This is where global concerns live: fonts, global styles, and the Redux
// store provider. It intentionally contains no page content.

import type { Metadata } from "next";
import { AuthSessionProvider } from "@/features/auth/AuthSessionProvider";
import { StoreProvider } from "@/store/StoreProvider";
import { Navigation } from "@/components/navigation/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevHub",
  description: "A LinkedIn-style social platform for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthSessionProvider />
          <Navigation />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
