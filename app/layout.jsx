import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_navbar/page.jsx";
import { LanguageProvider } from '@/contexts/LanguageContext';
import Footer from "./_footer/page";

const rubik = Rubik({
  variable: "--font-rubik-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "مطبخ ام خاطر",
  description: "أشهى المأكولات العربية التقليدية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${rubik.className} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}