import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ZORRAGA - Sélecteur de Véhicules",
  description: "Trouvez et sélectionnez votre véhicule facilement. Sélecteur intelligent pour toutes marques automobiles.",
  keywords: "sélecteur véhicule, automobile, voiture, Renault, Citroën, Dacia, Suzuki, modèle auto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-hero bg-fixed">
            <div className="min-h-screen bg-hero-blur bg-background/95 backdrop-blur-sm dark:bg-background dark:backdrop-blur-md">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}