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
        
        if (navData && navData.ar && navData.ar.logo && navData.ar.menu_items && navData.en && navData.en.logo && navData.en.menu_items) {
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
      
      if (currentScrollY < 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      
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
    cardBg: "rgb(28 17 14)",
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-16 bg-red-900/50 text-red-200">
        <p className="text-sm px-4">{language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
      </div>
    );
  }

  if (!navbarData) {
    return (
      <nav 
        className="shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: colors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="w-24 sm:w-32 h-6 sm:h-8 animate-pulse rounded" style={{ backgroundColor: colors.accent }}></div>
          </div>
        </div>
      </nav>
    );
  }

  const currentLangData = navbarData[language];
  const { logo, menu_items } = currentLangData;

  return (
    <>
      <Cart language={language} />
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.3s ease-in-out' }}
            onClick={cancelLogout}
          />
          
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4 px-4"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            <div 
              className="rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border-2"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.secondary
              }}
            >
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ 
                  backgroundColor: colors.primary + '20',
                  border: `2px sm:3px solid ${colors.primary}`
                }}
              >
                <LogOut size={window.innerWidth < 640 ? 24 : 32} style={{ color: colors.primary }} />
              </div>
              
              <h3 
                className="text-xl sm:text-2xl font-black text-center mb-3 sm:mb-4"
                style={{ color: colors.text }}
              >
                {t.confirmLogoutTitle}
              </h3>
              
              <p 
                className="text-sm sm:text-base text-center mb-6 sm:mb-8 leading-relaxed px-2"
                style={{ color: colors.secondary }}
              >
                {t.confirmLogoutMessage}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={cancelLogout}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold transition-all duration-300 hover:scale-105 border-2 text-sm sm:text-base"
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
                  className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
            <div 
              className="rounded-full overflow-hidden shadow-lg border-2 flex items-center justify-center w-[45px] h-[45px] sm:w-[45px] sm:h-[45px] md:w-[45px] md:h-[45px] lg:w-[55px] lg:h-[55px]"
              style={{ 
                borderColor: colors.secondary
              }}
            >
              <img
                src={logo.image_url}
                alt={logo.alt_text}
                className="w-full h-full object-cover scale-[1.4]"
              />
            </div>
              <span 
                className="text-base sm:text-xl md:text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {logo.name}
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {menu_items.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="px-3 xl:px-4 py-2 rounded-md text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
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
                  {item.title}
                </a>
              ))}
              
              {/* Cart Button - Desktop Only */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
                style={{
                  color: colors.text,
                  backgroundColor: colors.accent
                }}
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 min-w-[22px] h-5 xl:min-w-[24px] xl:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white px-1.5 animate-pulse"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105 whitespace-nowrap"
                style={{
                  color: colors.text,
                  backgroundColor: colors.accent
                }}
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Globe size={16} />
                <span className="font-bold text-sm">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              {/* Auth Section */}
              {status === 'loading' ? (
                <div 
                  className="px-3 xl:px-4 py-2 rounded-md animate-pulse"
                  style={{ backgroundColor: colors.accent }}
                >
                  <div className="h-5 w-16 xl:w-20 bg-gray-400 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md" style={{ backgroundColor: colors.accent }}>
                    <User size={16} style={{ color: colors.text }} />
                    <span className="font-medium text-sm whitespace-nowrap" style={{ color: colors.text }}>
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
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md font-bold transition-all duration-200 hover:scale-105 whitespace-nowrap"
                  style={{
                    color: 'white',
                    backgroundColor: colors.primary
                  }}
                >
                  <LogIn size={16} />
                  <span className="text-sm">{t.login}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Buttons */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-all duration-200 hover:scale-105 whitespace-nowrap"
                style={{
                  color: colors.text,
                  backgroundColor: colors.accent
                }}
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-bold text-xs sm:text-sm">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 sm:p-2 rounded-md"
                style={{ color: colors.text }}
              >
                {isMenuOpen ? <X size={22} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="lg:hidden pb-3 sm:pb-4">
              <div className="flex flex-col space-y-1.5 sm:space-y-2">
                {/* Cart Button in Mobile Menu */}
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="relative flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base font-medium"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.accent
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} />
                    <span>{language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}</span>
                  </div>
                  {totalItems > 0 && (
                    <span 
                      className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-bold text-white px-2 animate-pulse"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      {totalItems}
                    </span>
                  )}
                </button>

                {menu_items.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base font-medium"
                    style={{
                      color: colors.text,
                      backgroundColor: item.active ? colors.primary : 'transparent'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </a>
                ))}
                
                {/* Auth Section in Mobile Menu */}
                {status === 'loading' ? (
                  <div 
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md animate-pulse"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <div className="h-5 w-20 bg-gray-400 rounded"></div>
                  </div>
                ) : session ? (
                  <div 
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md font-medium flex items-center justify-between text-sm sm:text-base"
                    style={{ backgroundColor: colors.accent, color: colors.text }}
                  >
                    <div className="flex items-center gap-2">
                      <User size={18} />
                      <span className="truncate">{t.welcome}, {session.user?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="p-1 flex-shrink-0 hover:scale-110 transition-all"
                      style={{ color: '#ef4444' }}
                      title={t.logout}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base font-bold transition-all duration-200"
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
            </div>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed ${language === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} bottom-4 sm:bottom-6 z-50 group transition-all duration-500 ease-in-out rounded-full ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-20 scale-0 pointer-events-none'
        }`}
        title={t.scrollToTop}
        aria-label={t.scrollToTop}
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14">
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"
            style={{ backgroundColor: colors.secondary }}
          ></div>
          
          <div 
            className="relative w-full h-full flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 border-2"
            style={{ 
              backgroundColor: colors.primary,
              borderColor: colors.secondary,
              boxShadow: '0 8px 32px rgba(218, 165, 32, 0.4)'
            }}
          >
            <ArrowUp 
              size={20}
              strokeWidth={3}
              className="text-white group-hover:animate-bounce sm:w-6 sm:h-6"
            />
          </div>
        </div>
      </button>
    </>
  );
};

export default RestaurantNavbar;