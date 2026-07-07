import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Lato } from "next/font/google";
import "./globals.css";
import { brand, SITE_URL } from "@/lib/brand";

// Body / UI: Lato — humanist sans that carries paragraphs, nav, buttons,
// labels, and forms. Not variable, so weights are explicit: 400 + 700.
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

// Display: Fraunces — a serif with real character; the optical-size axis
// keeps it sturdy at text sizes and expressive at hero sizes.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

// Numerals / codes: JetBrains Mono for prices, stat callouts, and booking
// numbers — tabular texture where figures need to line up and feel exact.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  keywords: [
    "local services",
    "handyman",
    "cleaning",
    "plumbing",
    "electrician",
    "yard work",
    "moving help",
    "book a pro near me",
  ],
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${lato.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
