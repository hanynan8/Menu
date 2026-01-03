// app/layout.jsx

import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider, CartNotification } from './components/cart';
import SessionWrapper from './components/SessionWrapper';
import Footer from './components/footer';

export const metadata = {
  title: "مطبخ ام خاطر | طبخ بيتي - أكل صحي - توصيل سريع في دبي | Um Khater Kitchen Dubai",
  description: "مطبخ ام خاطر - أفضل مطبخ بيتي في دبي. وجبات طازجة يومياً، طبخ منزلي صحي، أكلات عربية أصيلة، توصيل سريع لكل أنحاء دبي. اطلب الآن واستمتع بطعم البيت الأصيل | Um Khater Kitchen - Best homemade food in Dubai, fresh daily meals, healthy home cooking, authentic Arabic cuisine, fast delivery across Dubai",
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  
  manifest: '/site.webmanifest',
  
  keywords: [
    // كلمات عربية
    "مطبخ ام خاطر",
    "طبخ بيتي دبي",
    "أكل بيتي دبي",
    "وجبات صحية دبي",
    "طعام منزلي دبي",
    "مطبخ منزلي",
    "أكلات عربية دبي",
    "وجبات طازجة",
    "توصيل طعام دبي",
    "غداء بيتي",
    "عشاء بيتي",
    "طبخات يومية",
    "أكل صحي",
    "وجبات جاهزة",
    "مطابخ منزلية دبي",
    
    // كلمات إنجليزية
    "Um Khater Kitchen",
    "home cooked food Dubai",
    "homemade meals Dubai",
    "healthy food Dubai",
    "Arabic food Dubai",
    "fresh meals Dubai",
    "home kitchen Dubai",
    "daily meals",
    "food delivery Dubai",
    "authentic Arabic cuisine",
    "home cooking",
    "traditional food"
  ].join(", "),
  
  authors: [{ name: "Um Khater Kitchen" }],
  creator: "Um Khater Kitchen",
  publisher: "Um Khater Kitchen",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: 'https://yourdomain.com', // غير الدومين هنا
    languages: {
      'ar': 'https://yourdomain.com/ar',
      'en': 'https://yourdomain.com/en',
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'ar_AE',
    alternateLocale: ['en_US'],
    url: 'https://yourdomain.com', // غير الدومين هنا
    siteName: 'مطبخ ام خاطر | Um Khater Kitchen',
    title: 'مطبخ ام خاطر - أفضل طبخ بيتي في دبي | Um Khater Kitchen Dubai',
    description: 'مطبخ ام خاطر - وجبات طازجة يومياً، طبخ منزلي صحي، أكلات عربية أصيلة، توصيل سريع لكل أنحاء دبي. طعم البيت الأصيل',
    images: [
      {
        url: 'https://github.com/hanynan8/Menu-Pic/blob/main/WhatsApp%20Image%202025-12-14%20at%204.55.14%20PM.jpeg?raw=true',
        width: 1200,
        height: 630,
        alt: 'مطبخ ام خاطر - طبخ بيتي في دبي',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'مطبخ ام خاطر - أفضل طبخ بيتي في دبي',
    description: 'وجبات طازجة يومياً، طبخ منزلي صحي، أكلات عربية أصيلة، توصيل سريع في دبي',
    images: ['https://github.com/hanynan8/Menu-Pic/blob/main/WhatsApp%20Image%202025-12-14%20at%204.55.14%20PM.jpeg?raw=true'],
    creator: '@umkhaterkitchen',
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  
  category: 'food',
  
  other: {
    'application-name': 'مطبخ ام خاطر',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'مطبخ ام خاطر',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Custom Favicon Styling */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            link[rel="icon"], 
            link[rel="shortcut icon"],
            link[rel="apple-touch-icon"] {
              border-radius: 50% !important;
            }
          `
        }} />
        
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "مطبخ ام خاطر",
              "alternateName": "Um Khater Kitchen",
              "description": "أفضل مطبخ بيتي في دبي - وجبات طازجة يومياً",
              "servesCuisine": ["Arabic", "Middle Eastern", "Home Cooking"],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dubai",
                "addressCountry": "AE"
              },
              "priceRange": "$$",
              "telephone": "+971-XX-XXX-XXXX", // حط رقم التليفون
              "url": "https://yourdomain.com", // غير الدومين هنا
              "image": "https://github.com/hanynan8/Menu-Pic/blob/main/WhatsApp%20Image%202025-12-14%20at%204.55.14%20PM.jpeg?raw=true",
              "sameAs": [
                "https://www.facebook.com/umkhaterkitchen", // حط لينكات السوشيال ميديا
                "https://www.instagram.com/umkhaterkitchen",
                "https://twitter.com/umkhaterkitchen"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
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