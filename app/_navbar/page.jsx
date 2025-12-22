'use client'
import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const RestaurantNavbar = () => {
  const [navbarData, setNavbarData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/data?collection=navbar');
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchNavbarData();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16 bg-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-16 bg-red-100 text-red-600">
        <p className="text-sm">{language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}: {error}</p>
      </div>
    );
  }

  if (!navbarData) {
    return null;
  }

  const { logo, menu_items, styles } = navbarData;

  return (
    <nav 
      className={`shadow-lg fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ backgroundColor: styles.background_color }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo.image_url}
              alt={logo.alt_text}
              width={logo.width}
              height={logo.height}
              className="rounded-full object-cover shadow-lg"
            />
            <span 
              className="text-xl font-bold"
              style={{ color: styles.text_color }}
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
                  color: styles.text_color,
                  backgroundColor: item.active ? styles.hover_color : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.target.style.backgroundColor = styles.hover_color;
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
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
              style={{
                color: styles.text_color,
                backgroundColor: styles.hover_color
              }}
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe size={18} />
              <span className="font-bold">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>

          {/* Mobile menu button and Language Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Toggle for Mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-md transition-all duration-200"
              style={{ color: styles.text_color }}
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe size={20} />
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md"
              style={{ color: styles.text_color }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {menu_items.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="px-4 py-2 rounded-md text-base font-medium"
                  style={{
                    color: styles.text_color,
                    backgroundColor: item.active ? styles.hover_color : 'transparent'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'ar' ? item.title : item.title_en}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RestaurantNavbar;