import type { Metadata } from "next";
import "./globals.css";
import TrpcProvider from "@repo/trpc/TrpcProvider";

export const metadata: Metadata = {
  title: "BE: Tech Stack",
  description: "Powered by TurboRepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider url={process.env.NEXT_PUBLIC_TRPC_URL!}>
          {children}
        </TrpcProvider>
      </body>
    </html>
  );
}
