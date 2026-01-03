'use client'
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    // جلب بيانات الفوتر
    fetch('/api/data?collection=footer')
      .then(res => res.json())
      .then(result => {
        setFooterData(result[0].footer);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching footer data:', err);
        setLoading(false);
      });

    // جلب رقم الواتساب
    fetch('/api/data?collection=whatsapp')
      .then(res => res.json())
      .then(data => {
        let whatsappData = null;
        if (data.whatsapp && Array.isArray(data.whatsapp) && data.whatsapp.length > 0) {
          whatsappData = data.whatsapp[0];
        } else if (Array.isArray(data) && data.length > 0) {
          whatsappData = data[0];
        }
        
        if (whatsappData?.whatsApp) {
          const cleanNumber = whatsappData.whatsApp.replace(/[+\s]/g, '');
          setWhatsappNumber(cleanNumber);
        } else {
          setWhatsappNumber('201201061216');
        }
      })
      .catch(err => {
        console.error('Error fetching WhatsApp number:', err);
        setWhatsappNumber('201201061216');
      });
  }, []);

  const handleOrderNow = () => {
    if (!whatsappNumber) {
      alert(language === 'ar' ? 'عذراً، رقم الواتساب غير متوفر حالياً' : 'Sorry, WhatsApp number is not available');
      return;
    }

    const message = language === 'ar' 
      ? `مرحباً 
أود الاستفسار عن منتجاتكم والأسعار.

أرجو تزويدي بالتفاصيل والعروض المتاحة.

شكراً لكم `
      : `Hello 
I would like to inquire about your products and prices.

Please provide me with details and available offers.

Thank you `;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || !footerData) {
    return null;
  }
  
  const colors = {
    primary: "#DAA520",
    secondary: "#CD853F",
    accent: "#8B4513",
    background: "#1A1410",
    cardBg: "#2D2420",
    text: "#F5DEB3"
  };

  const footer = footerData[language];

  const getSocialIcon = (iconName) => {
    switch (iconName) {
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // التحقق من نوع location
  const getLocationData = () => {
    const location = footer.contact.location;
    if (typeof location === 'string') {
      return { text: location, url: null };
    }
    return location;
  };

  const locationData = getLocationData();

  return (
    <footer 
      className="relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Decorative top border */}
      <div 
        className="h-1 w-full"
        style={{ 
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`
        }}
      />

      {/* Main Footer Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
          
          {/* About Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-black mb-3 w-fit sm:mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
              style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
            >
              {footer.about.title}
            </h3>
            <p 
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: colors.text + 'CC' }}
            >
              {footer.about.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 
              className="text-lg sm:text-xl md:text-2xl w-fit font-black mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
              style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
            >
              {footer.quickLinks.title}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {footer.quickLinks.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className={`group flex items-center gap-2 transition-all duration-300 text-xs sm:text-sm ${language === 'ar' ? 'hover:-translate-x-2' : 'hover:translate-x-2'}`}
                    style={{ color: colors.text + 'CC' }}
                  >
                    <ChevronRight 
                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300 ${language === 'ar' ? 'rotate-180' : ''}`}
                      style={{ color: colors.secondary }}
                    />
                    <span className="group-hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 
              className="text-lg sm:text-xl md:text-2xl w-fit font-black mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
              style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
            >
              {footer.contact.title}
            </h3>
            <ul className="space-y-3 sm:space-y-4 md:space-y-5">
              <li className="flex items-start gap-2 sm:gap-3 group">
                <Phone 
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <a 
                    href={`tel:${footer.contact.phone.replace(/\s/g, '')}`}
                    className="text-xs sm:text-sm font-bold hover:text-white transition-colors duration-300 break-all"
                    style={{ color: colors.text }}
                  >
                    {footer.contact.phone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2 sm:gap-3 group">
                <Mail 
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <a 
                    href={`mailto:${footer.contact.email}`}
                    className="text-xs sm:text-sm font-bold hover:text-white transition-colors duration-300 break-all"
                    style={{ color: colors.text }}
                  >
                    {footer.contact.email}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2 sm:gap-3 group">
                <MapPin 
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'الموقع' : 'Location'}
                  </p>
                  {locationData.url ? (
                    <a 
                      href={locationData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold hover:text-white transition-colors duration-300 break-words underline-offset-2"
                      style={{ color: colors.text }}
                    >
                      {locationData.text}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm font-bold break-words" style={{ color: colors.text }}>
                      {locationData.text}
                    </p>
                  )}
                </div>
              </li>

              <li className="flex items-start gap-2 sm:gap-3 group">
                <Clock 
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'ساعات العمل' : 'Hours'}
                  </p>
                  <p className="text-xs sm:text-sm font-bold break-words" style={{ color: colors.text }}>
                    {footer.contact.hours}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-3 sm:space-y-4">
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-black w-fit mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
              style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
            >
              {footer.social.title}
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {footer.social.platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 border-2"
                  style={{ 
                    backgroundColor: colors.cardBg,
                    borderColor: colors.secondary + '40'
                  }}
                  aria-label={platform.name}
                >
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                    style={{ backgroundColor: colors.primary + '60' }}
                  />
                  <div 
                    className="relative transition-colors duration-300 group-hover:text-white"
                    style={{ color: colors.secondary }}
                  >
                    {getSocialIcon(platform.icon)}
                  </div>
                </a>
              ))}
            </div>

            {/* Newsletter or CTA */}
            <div 
              className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 rounded-xl border-2"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.secondary + '40'
              }}
            >
              <p className="text-xs sm:text-sm font-bold mb-2 sm:mb-3" style={{ color: colors.text }}>
                {language === 'ar' ? 'اطلب الآن واستمتع بأشهى الأطباق' : 'Order Now and Enjoy Delicious Dishes'}
              </p>
              <button 
                onClick={handleOrderNow}
                className="w-full text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border text-xs sm:text-sm md:text-base flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.secondary + '4D'
                }}
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>{language === 'ar' ? 'اطلب الآن' : 'Order Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t-2 py-4 sm:py-5 md:py-6"
        style={{ 
          borderColor: colors.secondary + '30',
          backgroundColor: colors.cardBg
        }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <p 
            className="text-xs sm:text-sm font-medium text-center break-words px-2"
            style={{ color: colors.text + 'CC' }}
          >
            {footer.copyright}
          </p>
        </div>
      </div>

      {/* Decorative background pattern */}
      <div 
        className="absolute inset-x-0 bottom-0 h-24 md:h-32 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${colors.secondary} 0, ${colors.secondary} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px'
        }}
      />
    </footer>
  );
} 