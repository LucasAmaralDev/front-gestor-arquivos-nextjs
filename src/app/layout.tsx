import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coleta de Documentos",
  description: "Gerenciado por Geoweb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning={true}>
      <AppRouterCacheProvider>
        <body className={inter.className} suppressHydrationWarning={true}>{children}</body>
      </AppRouterCacheProvider>
    </html>
  );
}
