'use client'
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/data?collection=footer')
      .then(res => res.json())
      .then(result => {
        setFooterData(result[0].footer);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching footer data:', err);
        setLoading(false);
      });
  }, []);

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
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* About Section */}
          <div className="space-y-4">
            <h3 
              className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
            >
              {footer.about.title}
            </h3>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: colors.text + 'CC' }}
            >
              {footer.about.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 
              className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
            >
              {footer.quickLinks.title}
            </h3>
            <ul className="space-y-3">
              {footer.quickLinks.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="group flex items-center gap-2 transition-all duration-300 hover:translate-x-2"
                    style={{ color: colors.text + 'CC' }}
                  >
                    <ChevronRight 
                      className={`w-4 h-4 transition-colors duration-300 ${language === 'ar' ? 'rotate-180' : ''}`}
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
          <div className="space-y-4">
            <h3 
              className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
            >
              {footer.contact.title}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <Phone 
                  className="w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </p>
                  <a 
                    href={`tel:${footer.contact.phone.replace(/\s/g, '')}`}
                    className="text-sm font-bold hover:text-white transition-colors duration-300"
                    style={{ color: colors.text }}
                  >
                    {footer.contact.phone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <Mail 
                  className="w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <a 
                    href={`mailto:${footer.contact.email}`}
                    className="text-sm font-bold hover:text-white transition-colors duration-300"
                    style={{ color: colors.text }}
                  >
                    {footer.contact.email}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <MapPin 
                  className="w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'الموقع' : 'Location'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>
                    {footer.contact.location}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <Clock 
                  className="w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-white" 
                  style={{ color: colors.secondary }}
                />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.secondary }}>
                    {language === 'ar' ? 'ساعات العمل' : 'Hours'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>
                    {footer.contact.hours}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 
              className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
            >
              {footer.social.title}
            </h3>
            <div className="flex flex-wrap gap-3">
              {footer.social.platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-full transition-all duration-300 hover:scale-110 border-2"
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
                    className="relative transition-colors duration-300"
                    style={{ color: colors.secondary }}
                  >
                    {getSocialIcon(platform.icon)}
                  </div>
                </a>
              ))}
            </div>

            {/* Newsletter or CTA */}
            <div 
              className="mt-8 p-4 rounded-xl border-2"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.secondary + '40'
              }}
            >
              <p className="text-sm font-bold mb-2" style={{ color: colors.text }}>
                {language === 'ar' ? 'اطلب الآن واستمتع بأشهى الأطباق' : 'Order Now and Enjoy Delicious Dishes'}
              </p>
              <button 
                className="w-full text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-all duration-300 border"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.secondary + '4D'
                }}
              >
                {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t-2 py-6"
        style={{ 
          borderColor: colors.secondary + '30',
          backgroundColor: colors.cardBg
        }}
      >
        <div className="container mx-auto px-6">
            <p 
              className="text-sm font-medium text-center"
              style={{ color: colors.text + 'CC' }}
            >
              {footer.copyright}
            </p>
          </div>
      </div>

      {/* Decorative background pattern */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${colors.secondary} 0, ${colors.secondary} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px'
        }}
      />
    </footer>
  );
}