// app/components/navbar.jsx
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, Globe, ShoppingCart, LogIn, User, LogOut, ArrowUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from './cart';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Cart from './cart';

const RestaurantNavbar = () => {
  const [navbarData, setNavbarData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { getTotalItems, setIsCartOpen } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const response = await fetch('/api/data?collection=navbar');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let navData = null;
        
        if (data.navbar && Array.isArray(data.navbar) && data.navbar.length > 0) {
          navData = data.navbar[0].navbar;
        } else if (data.navbar && !Array.isArray(data.navbar)) {
          navData = data.navbar;
        } else if (Array.isArray(data) && data.length > 0) {
          navData = data[0].navbar;
        }
        
        if (navData && navData.logo && navData.menu_items) {
          setNavbarData(navData);
          setError(null);
        } else {
          console.error('Data structure:', data);
          throw new Error('Invalid data format');
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching navbar data:', err);
      }
    };

    fetchNavbarData();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // إخفاء/إظهار الـ Navbar
      if (currentScrollY < 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      
      // إظهار/إخفاء زرار الصعود لأعلى
      if (currentScrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const colors = {
    primary: "#DAA520",
    secondary: "#CD853F",
    accent: "#8B4513",
    background: "#1A1410",
    cardBg: "#2D2420",
    text: "#F5DEB3"
  };

  const translations = {
    ar: {
      login: 'تسجيل الدخول',
      welcome: 'مرحباً',
      profile: 'الملف الشخصي',
      logout: 'تسجيل خروج',
      confirmLogoutTitle: 'تسجيل الخروج',
      confirmLogoutMessage: 'هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء جلستك وستحتاج إلى تسجيل الدخول مرة أخرى.',
      confirmButton: 'نعم، تسجيل الخروج',
      cancelButton: 'إلغاء',
      scrollToTop: 'العودة لأعلى'
    },
    en: {
      login: 'Login',
      welcome: 'Welcome',
      profile: 'Profile',
      logout: 'Logout',
      confirmLogoutTitle: 'Logout',
      confirmLogoutMessage: 'Are you sure you want to logout? Your session will end and you will need to login again.',
      confirmButton: 'Yes, Logout',
      cancelButton: 'Cancel',
      scrollToTop: 'Back to top'
    }
  };

  const t = translations[language];

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut({ callbackUrl: '/' });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // لو في خطأ، اعرض رسالة بسيطة
  if (error) {
    return (
      <div className="flex items-center justify-center h-16 bg-red-900/50 text-red-200">
        <p className="text-sm">{language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
      </div>
    );
  }

  // لو البيانات لسه بتحمّل، اعرض Navbar فاضي
  if (!navbarData) {
    return (
      <nav 
        className="shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: colors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-32 h-8 animate-pulse rounded" style={{ backgroundColor: colors.accent }}></div>
          </div>
        </div>
      </nav>
    );
  }

  const { logo, menu_items } = navbarData;

  return (
    <>
      <Cart language={language} />
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.3s ease-in-out' }}
            onClick={cancelLogout}
          />
          
          {/* Modal */}
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            <div 
              className="rounded-2xl p-8 shadow-2xl border-2"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.secondary
              }}
            >
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  backgroundColor: colors.primary + '20',
                  border: `3px solid ${colors.primary}`
                }}
              >
                <LogOut size={32} style={{ color: colors.primary }} />
              </div>
              
              {/* Title */}
              <h3 
                className="text-2xl font-black text-center mb-4"
                style={{ color: colors.text }}
              >
                {t.confirmLogoutTitle}
              </h3>
              
              {/* Message */}
              <p 
                className="text-center mb-8 leading-relaxed"
                style={{ color: colors.secondary }}
              >
                {t.confirmLogoutMessage}
              </p>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={cancelLogout}
                  className="flex-1 rounded-xl font-bold transition-all duration-300 hover:scale-105 border-2"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: colors.secondary,
                    color: colors.secondary
                  }}
                >
                  {t.cancelButton}
                </button>
                
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  {t.confirmButton}
                </button>
              </div>
            </div>
          </div>
          
          {/* CSS Animations */}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes scaleIn {
              from { 
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
              }
              to { 
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
          `}</style>
        </>
      )}
      
      {/* Navbar */}
      <nav 
        className={`shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ backgroundColor: colors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={logo.image_url}
                alt={logo.alt_text}
                width={logo.width || 48}
                height={logo.height || 48}
                className="rounded-full object-cover shadow-lg border-2"
                style={{ borderColor: colors.secondary }}
              />
              <span 
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                {language === 'ar' ? logo.name : (logo.name_en || 'Gourmet Restaurant')}
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {menu_items.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="px-4 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  style={{
                    color: colors.text,
                    backgroundColor: item.active ? colors.primary : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.active) {
                      e.target.style.backgroundColor = colors.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {language === 'ar' ? item.title : item.title_en}
                </a>
              ))}
              
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
                style={{
                  color: colors.text,
                  backgroundColor: colors.accent
                }}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-bold text-white px-1.5 animate-pulse"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
                style={{
                  color: colors.text,
                  backgroundColor: colors.accent
                }}
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Globe size={18} />
                <span className="font-bold">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              {/* Auth Section */}
              {status === 'loading' ? (
                <div 
                  className="px-4 py-2 rounded-md animate-pulse"
                  style={{ backgroundColor: colors.accent }}
                >
                  <div className="h-5 w-20 bg-gray-400 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-md" style={{ backgroundColor: colors.accent }}>
                    <User size={18} style={{ color: colors.text }} />
                    <span className="font-medium" style={{ color: colors.text }}>
                      {t.welcome}, {session.user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md hover:scale-110 transition-all duration-200"
                    style={{ 
                      color: '#ef4444',
                    }}
                    title={t.logout}
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    color: 'white',
                    backgroundColor: colors.primary
                  }}
                >
                  <LogIn size={18} />
                  <span>{t.login}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-md transition-all duration-200"
                style={{ color: colors.text }}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-bold text-white px-1 animate-pulse"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={toggleLanguage}
                className="p-2 rounded-md transition-all duration-200"
                style={{ color: colors.text }}
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Globe size={20} />
              </button>

              {/* Mobile Auth Button */}
              {status === 'loading' ? (
                <div className="w-10 h-10 animate-pulse rounded-md" style={{ backgroundColor: colors.accent }}></div>
              ) : session ? (
                <>
                  <div className="p-2 rounded-md" style={{ backgroundColor: colors.accent }}>
                    <User size={20} style={{ color: colors.text }} />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md transition-all duration-200"
                    style={{ 
                      color: '#ef4444',
                      backgroundColor: colors.accent
                    }}
                    title={t.logout}
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="p-2 rounded-md transition-all duration-200"
                  style={{ 
                    color: 'white',
                    backgroundColor: colors.primary
                  }}
                >
                  <LogIn size={20} />
                </button>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md"
                style={{ color: colors.text }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                {menu_items.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    className="px-4 py-2 rounded-md text-base font-medium"
                    style={{
                      color: colors.text,
                      backgroundColor: item.active ? colors.primary : 'transparent'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {language === 'ar' ? item.title : item.title_en}
                  </a>
                ))}
                
                {/* User Info in Mobile Menu */}
                {session && (
                  <div 
                    className="px-4 py-2 rounded-md font-medium flex items-center justify-between"
                    style={{ backgroundColor: colors.accent, color: colors.text }}
                  >
                    <span>{t.welcome}, {session.user?.name || 'User'}</span>
                    <button
                      onClick={handleLogout}
                      className="p-1"
                      style={{ color: '#ef4444' }}
                      title={t.logout}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed ${language === 'ar' ? 'left-6' : 'right-6'} bottom-6 z-50 group transition-all duration-500 ease-in-out rounded-full ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-20 scale-0 pointer-events-none'
        }`}
        title={t.scrollToTop}
        aria-label={t.scrollToTop}
      >
        <div className="relative w-14 h-14">
          {/* Glow Effect */}
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"
            style={{ backgroundColor: colors.secondary }}
          ></div>
          
          {/* Button Content */}
          <div 
            className="relative w-full h-full flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 border-2"
            style={{ 
              backgroundColor: colors.primary,
              borderColor: colors.secondary,
              boxShadow: '0 8px 32px rgba(218, 165, 32, 0.4)'
            }}
          >
            <ArrowUp 
              size={24} 
              strokeWidth={3}
              className="text-white group-hover:animate-bounce"
            />
          </div>
        </div>
      </button>
    </>
  );
};

export default RestaurantNavbar;