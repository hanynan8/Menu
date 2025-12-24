// app/layout.jsx

import { Tajawal } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider, CartNotification } from './components/cart';
import SessionWrapper from './components/SessionWrapper';
import Footer from './components/footer';

const tajawal = Tajawal({
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata = {
  title: "مطبخ ام خاطر | Um Khater Kitchen",
  description: "أفضل مطبخ في المدينة | The best Kitchen in Dubai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} antialiased`}>
        <SessionWrapper>
          <LanguageProvider>
            <CartProvider>
              {/* مكون الإشعارات - مهم جداً! */}
              <CartNotification />
              
              {children}
              <Footer />
            </CartProvider>
          </LanguageProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}