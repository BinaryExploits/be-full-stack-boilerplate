import type { Metadata } from "next";
import "./globals.css";
import TrpcProvider from "@repo/trpc/TrpcProvider";
import { DefaultLogger, Logger, LogLevel } from "@repo/utils-core";
import { LoggerProvider } from "@repo/ui/LoggerProvider";

export const metadata: Metadata = {
  title: "BE: Tech Stack",
  description: "Powered by TurboRepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  Logger.setInstance(new DefaultLogger(LogLevel.INFO)); // for server-side rendering
  Logger.instance.info("RootLayout rendered");
  return (
    <html lang="en">
      <body>
        <TrpcProvider url={process.env.NEXT_PUBLIC_TRPC_URL!}>
          <LoggerProvider>{children}</LoggerProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
