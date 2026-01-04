'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Phone, MapPin, Clock, Star, ShoppingCart, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from './components/cart';
import { useSession } from 'next-auth/react';
import Navbar from './components/navbar';
import Image from 'next/image';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [visibleCategories, setVisibleCategories] = useState(new Set());
  const categoryRefs = useRef({});
  const { language } = useLanguage();
  const { addToCart, getTotalItems, setIsCartOpen } = useCart();
  const { data: session } = useSession();

  const totalItems = getTotalItems();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    fetch('/api/data', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(result => {
        setData(result.Menu[0]);
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error('Request timeout');
        } else {
          console.error('Error fetching data:', err);
        }
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (data?.heroSlider?.settings?.autoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => 
          prev === data.heroSlider.slides.length - 1 ? 0 : prev + 1
        );
      }, data.heroSlider.settings.interval || 5000);
      return () => clearInterval(interval);
    }
  }, [data]);

  // Intersection Observer for lazy loading images - MUST be before any conditional returns
  useEffect(() => {
    if (!data) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const itemId = entry.target.getAttribute('data-item-id');
          if (itemId) {
            setLoadedImages(prev => new Set([...prev, itemId]));
          }
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    const imageContainers = document.querySelectorAll('[data-item-id]');
    imageContainers.forEach(container => imageObserver.observe(container));

    return () => imageObserver.disconnect();
  }, [data, selectedCategory, searchQuery]);

  // Intersection Observer for categories lazy loading
  useEffect(() => {
    if (!data) return;

    const categoryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute('data-category-id');
          if (categoryId) {
            setVisibleCategories(prev => new Set([...prev, categoryId]));
          }
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) categoryObserver.observe(ref);
    });

    return () => categoryObserver.disconnect();
  }, [data]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center" 
        style={{ backgroundColor: '#1A1410' }}
      >
        <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin mb-4" style={{ color: '#DAA520' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1A1410' }}>
        <div className="text-xl sm:text-2xl font-bold text-red-400 text-center">
          {language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
        </div>
      </div>
    );
  }

  const restaurant = data.restaurant[language];
  const hero = data.hero[language];
  const heroSlider = data.heroSlider;
  const colors = {
    primary: "#DAA520",
    secondary: "#CD853F",
    accent: "#8B4513",
    background: "#1A1410",
    cardBg: "#2D2420",
    text: "#F5DEB3"
  };

  const allItems = data.categories.flatMap(cat => 
    cat.items.map(item => ({
      ...item,
      category: cat.id,
      categoryName: cat[language].name,
      categoryImage: cat.image
    }))
  );

  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item[language].name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const nextSlide = () => {
    setCurrentSlide(prev => 
      prev === heroSlider.slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(prev => 
      prev === 0 ? heroSlider.slides.length - 1 : prev - 1
    );
  };

  const translations = {
    ar: {
      allCategories: 'كل الأصناف',
      searchPlaceholder: 'ابحث عن طبقك المفضل...',
      orderNow: 'أضف للسلة',
      contactUs: 'تواصل معنا',
      noResults: 'لم نجد نتائج',
      tryDifferent: 'جرب البحث بكلمات أخرى أو اختر تصنيف مختلف',
      normalPrice: 'السعر العادي',
      openingHours: 'ساعات العمل',
      dailyHours: 'يومياً من 10 صباحاً - 12 منتصف الليل',
      addToCart: 'أضف للسلة',
      unavailable: 'غير متوفر'
    },
    en: {
      allCategories: 'All Categories',
      searchPlaceholder: 'Search for your favorite dish...',
      orderNow: 'Add to Cart',
      contactUs: 'Contact Us',
      noResults: 'No Results Found',
      tryDifferent: 'Try different keywords or select another category',
      normalPrice: '',
      openingHours: 'Opening Hours',
      dailyHours: 'Daily 10 AM - 12 Midnight',
      addToCart: 'Add to Cart',
      unavailable: 'Un Available'
    }
  };

  const t = translations[language];

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item[language].name,
      price: item[language].price,
      currency: item[language].currency,
      image: item.image
    };

    addToCart(cartItem);
  };

  const handleAddSlideToCart = (slide) => {
    const slideItem = {
      id: `slide-${slide.id}`,
      name: slide[language].title,
      price: slide[language].price,
      currency: slide[language].currency,
      image: slide.image
    };

    addToCart(slideItem);
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen" style={{ backgroundColor: colors.background }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Slider */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
        {heroSlider.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 z-10">
              <div
                className="absolute inset-0 bg-gradient-to-b lg:hidden"
                style={{
                  backgroundImage: `linear-gradient(
                    to bottom,
                    transparent 0%,
                    transparent 40%,
                    rgba(0,0,0,0.2) 60%,
                    rgba(0,0,0,1) 100%
                  )`
                }}
              />
            
              <div
                className="absolute inset-0 bg-gradient-to-b hidden lg:block"
                style={{
                  backgroundImage: `linear-gradient(
                    to bottom,
                    transparent 0%,
                    transparent 1%,
                    rgba(0,0,0,0.1) 40%,
                    rgba(0,0,0,0.4) 100%
                  )`
                }}
              />
            </div>
          
            <img
              src={slide.image}
              alt={slide[language].title}
              className="w-full h-full object-cover"
            />
          
            <div className="absolute inset-0 z-20 flex items-end pb-4 sm:pb-6 md:pb-10 lg:pb-0 lg:items-start lg:pt-24 xl:pt-28">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 w-full">
                <div className={`max-w-3xl ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                    <div
                      className="inline-flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm px-1.5 sm:px-2 md:px-2.5 lg:px-3.5 py-0.5 sm:py-0.5 md:py-1 rounded-full mb-[-5px] sm:mb-1.5 md:mb-2 lg:mb-3 shadow-md border"
                      style={{
                        backgroundColor: colors.primary + 'CC',
                        borderColor: colors.accent + '60'
                      }}
                    >
                      <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 fill-current animate-pulse flex-shrink-0" style={{ color: 'white' }} />
                      <span className="font-medium text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm" style={{ color: 'white' }}>
                        {slide[language].badge}
                      </span>
                    </div>
                  
                    <h1
                      className="text-2xl sm:text-3xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-black bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent w-full lg:mb-1.5 leading-relaxed drop-shadow-2xl"
                      style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
                    >
                      {slide[language].title}
                    </h1>
                  
                    <p
                      className="text-[14px] mt-[-5px] sm:text-[17px] md:text-[20px] lg:text-[25px] xl:text-[28px] mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 xl:mb-4  leading-snug sm:leading-relaxed max-w-2xl font-medium drop-shadow-md line-clamp-2 sm:line-clamp-3 md:line-clamp-none"
                      style={{ color: colors.text + 'E6' }}
                    >
                      {slide[language].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className={`absolute ${language === 'ar' ? 'right-1 sm:right-2 md:right-3 lg:right-4' : 'left-1 sm:left-2 md:left-3 lg:left-4'} top-1/2 -translate-y-1/2 z-30 group transition-all duration-300 hover:scale-110 active:scale-95`}
          aria-label={language === 'ar' ? 'الشريحة السابقة' : 'Previous slide'}
        >
          {language === 'ar' ? (
            <ChevronRight
              size={24}
              strokeWidth={2.5}
              className="drop-shadow-2xl transition-colors duration-300 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(255,215,0,0.4))'
              }}
            />
          ) : (
            <ChevronLeft
              size={24}
              strokeWidth={2.5}
              className="drop-shadow-2xl transition-colors duration-300 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(255,215,0,0.4))'
              }}
            />
          )}
        </button>
        <button
          onClick={nextSlide}
          className={`absolute ${language === 'ar' ? 'left-1 sm:left-2 md:left-3 lg:left-4' : 'right-1 sm:right-2 md:right-3 lg:right-4'} top-1/2 -translate-y-1/2 z-30 group transition-all duration-300 hover:scale-110 active:scale-95`}
          aria-label={language === 'ar' ? 'الشريحة التالية' : 'Next slide'}
        >
          {language === 'ar' ? (
            <ChevronLeft
              size={24}
              strokeWidth={2.5}
              className="drop-shadow-2xl transition-colors duration-300 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(255,215,0,0.4))'
              }}
            />
          ) : (
            <ChevronRight
              size={24}
              strokeWidth={2.5}
              className="drop-shadow-2xl transition-colors duration-300 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8)) drop-shadow(0 0 12px rgba(255,215,0,0.4))'
              }}
            />
          )}
        </button>
        
        {/* Slider Dots */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {heroSlider.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4.5 lg:h-4.5 shadow-lg'
                  : 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3.5 lg:h-3.5 opacity-30 hover:opacity-60 hover:scale-110'
              }`}
              style={{
                backgroundColor: colors.secondary
              }}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
{/* Search and Categories Bar */}
<div className="sticky top-0 z-40 shadow-lg border-b-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.secondary + '80' }}>
  <div className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3">
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Mobile: Search + Cart Button */}
<div className="w-full flex lg:hidden items-center justify-center gap-2 px-4">
  <div className="relative flex-1 max-w-md">
    <Search 
      className={`absolute ${language === 'ar' ? 'right-2 sm:right-3' : 'left-2 sm:left-3'} top-1/2 -translate-y-1/2 flex-shrink-0`} 
      style={{ color: colors.secondary }} 
      size={16} 
    />
    <input
      type="text"
      placeholder={t.searchPlaceholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-full ${language === 'ar' ? 'pr-9 sm:pr-10 pl-2 sm:pl-3' : 'pl-9 sm:pl-10 pr-2 sm:pr-3'} py-2 sm:py-2.5 rounded-lg border-2 focus:outline-none text-xs sm:text-sm font-medium transition-all duration-300`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.text,
        borderColor: colors.secondary,
        boxShadow: `0 0 10px ${colors.secondary}33`
      }}
      onFocus={(e) => {
        e.target.style.borderColor = colors.primary;
        e.target.style.boxShadow = `0 0 15px ${colors.primary}66`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.secondary;
        e.target.style.boxShadow = `0 0 10px ${colors.secondary}33`;
      }}
    />
  </div>

  <button
    onClick={() => setIsCartOpen(true)}
    className="relative flex items-center justify-center p-2 sm:p-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex-shrink-0"
    style={{
      color: colors.text,
      backgroundColor: colors.accent
    }}
  >
    <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
    {totalItems > 0 && (
      <span 
        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white px-1 animate-pulse"
        style={{ backgroundColor: '#ef4444' }}
      >
        {totalItems}
      </span>
    )}
  </button>
</div>
      {/* Desktop: All in One Row */}
      <div id='menu' className="w-full">
        {/* Mobile: Grid Layout for Categories */}
        <div className="grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2 md:gap-2.5 lg:hidden">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all duration-300 shadow-md border ${
              selectedCategory === 'all' ? 'scale-105 shadow-lg' : 'active:scale-95'
            }`}
            style={selectedCategory === 'all' ? { 
              backgroundColor: colors.primary,
              color: 'white',
              borderColor: colors.secondary,
              boxShadow: `0 3px 10px ${colors.primary}66`
            } : {
              backgroundColor: colors.background,
              color: colors.secondary,
              borderColor: colors.accent
            }}
          >
            <span className="whitespace-nowrap flex items-center justify-center">
              <span className="text-[10px]">{language === 'ar' ? 'كل الاكلات' : 'All'}</span>
            </span>
          </button>
          
          {data.categories.slice(0, 7).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center justify-center px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all duration-300 shadow-md border overflow-hidden ${
                selectedCategory === cat.id ? 'scale-105 shadow-lg' : 'active:scale-95'
              }`}
              style={selectedCategory === cat.id ? { 
                backgroundColor: colors.primary,
                color: 'white',
                borderColor: colors.secondary,
                boxShadow: `0 3px 10px ${colors.primary}66`
              } : {
                backgroundColor: colors.background,
                color: colors.secondary,
                borderColor: colors.accent
              }}
            >
              <span className="truncate max-w-full text-center leading-tight">
                {cat[language].name}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop: Single Row with Search + Categories + Cart */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs xl:max-w-sm">
            <Search 
              className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 flex-shrink-0`} 
              style={{ color: colors.secondary }} 
              size={16} 
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 rounded-lg border-2 focus:outline-none text-sm font-medium transition-all duration-300`}
              style={{ 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.secondary,
                boxShadow: `0 0 10px ${colors.secondary}33`
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 15px ${colors.primary}66`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.secondary;
                e.target.style.boxShadow = `0 0 10px ${colors.secondary}33`;
              }}
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 ">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 xl:px-5 py-2.5 rounded-lg font-bold text-sm xl:text-base transition-all duration-300 shadow-md border whitespace-nowrap ${
                selectedCategory === 'all' ? 'scale-105 shadow-lg' : 'active:scale-95'
              }`}
              style={selectedCategory === 'all' ? { 
                backgroundColor: colors.primary,
                color: 'white',
                borderColor: colors.secondary,
                boxShadow: `0 3px 10px ${colors.primary}66`
              } : {
                backgroundColor: colors.background,
                color: colors.secondary,
                borderColor: colors.accent
              }}
            >
              {t.allCategories}
            </button>
            
            {data.categories.slice(0, 7).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center justify-center px-3 xl:px-4 py-2.5 rounded-lg font-bold text-sm xl:text-base transition-all duration-300 shadow-md border overflow-hidden ${
                  selectedCategory === cat.id ? 'scale-105 shadow-lg' : 'active:scale-95'
                }`}
                style={selectedCategory === cat.id ? { 
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderColor: colors.secondary,
                  boxShadow: `0 3px 10px ${colors.primary}66`
                } : {
                  backgroundColor: colors.background,
                  color: colors.secondary,
                  borderColor: colors.accent
                }}
              >
                <span className="truncate max-w-full text-center leading-tight whitespace-nowrap">
                  {cat[language].name}
                </span>
              </button>
            ))}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex-shrink-0"
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
        </div>
      </div>
    </div>
  </div>
</div>
      {/* Menu Items Grid with Lazy Loading */}
      <div className="relative py-8 sm:py-12 md:py-16">
        
        {/* الباترن الإسلامي - بيغطي القسم كله */}
        
        {/* المحتوى - المنتجات */}
        <div className="relative container mx-auto px-3 sm:px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-500 border-2 cursor-pointer flex flex-col ${
                  loadedImages.has(item.id) 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-95'
                }`}
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: (hoveredItem === item.id || clickedItem === item.id) ? colors.secondary + '99' : colors.accent + '4D'
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setClickedItem(clickedItem === item.id ? null : item.id)}
              >
                {/* Image Container with Lazy Loading */}
                <div 
                  className="relative h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 overflow-hidden flex-shrink-0" 
                  data-item-id={item.id}
                >
                  {loadedImages.has(item.id) ? (
                    <>
                      <img
                        src={item.image}
                        alt={item[language].name}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                        style={{ 
                          opacity: ((hoveredItem === item.id || clickedItem === item.id) && item.hoverImage) ? 0 : 1,
                          transform: ((hoveredItem === item.id || clickedItem === item.id) && item.hoverImage) ? 'scale(1.2)' : 'scale(1)',
                          zIndex: 1
                        }}
                      />
                      {item.hoverImage && (
                        <img
                          src={item.hoverImage}
                          alt={item[language].name}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                          style={{ 
                            opacity: (hoveredItem === item.id || clickedItem === item.id) ? 1 : 0,
                            transform: (hoveredItem === item.id || clickedItem === item.id) ? 'scale(1.15)' : 'scale(1)',
                            zIndex: 2
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div 
                      className="absolute inset-0 w-full h-full flex items-center justify-center" 
                      style={{ backgroundColor: colors.primary + '40' }}
                    >
                      <div 
                        className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" 
                        style={{ 
                          borderColor: colors.secondary + '40', 
                          borderTopColor: 'transparent' 
                        }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 group-hover:bg-black/20 transition-all duration-500 z-10" />
                  
                  <div className="absolute inset-0 flex items-end p-2 sm:p-3 md:p-4 lg:p-6 z-20">
                    <p className={`text-amber-100 text-xs leading-relaxed transition-all duration-500 ${
                      (hoveredItem === item.id || clickedItem === item.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      {item[language].hoverDescription}
                    </p>
                  </div>
                  
                  {!item.available && (
                    <div className={`absolute top-1 sm:top-2 ${language === 'ar' ? 'right-1 sm:right-2' : 'left-1 sm:left-2'} bg-red-600 text-white font-bold text-[10px] sm:text-xs px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-full z-30`}>
                      {t.unavailable}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6 flex flex-col flex-grow">
<div className="w-full">
  <h3 
  className="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black transition-all duration-300 leading-tight sm:leading-snug md:leading-normal lg:leading-relaxed w-fit"
    style={{ 
      paddingTop: '0.2em', 
      paddingBottom: '0.2em',
      background: 'linear-gradient(90deg, white 0%, #fef08a 70%, #facc15 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}
  >
    {item[language].name}
  </h3>
</div>
                  <p className="text-xs leading-snug sm:leading-relaxed mb-2 sm:mb-3 md:mb-4 lg:mb-5 flex-grow " style={{ color: colors.secondary + 'CC' }}>
                    {item[language].description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 md:gap-3 mt-auto">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black" style={{ color: colors.secondary }}>{item[language].price}</span>
                      <span className="text-xs sm:text-sm font-bold" style={{ color: colors.secondary + 'CC' }}>{item[language].currency}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 text-white px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold shadow-lg transform hover:scale-105 sm:hover:scale-110 transition-all duration-300 border whitespace-nowrap text-xs" 
                      style={{ backgroundColor: colors.primary, borderColor: colors.secondary + '4D' }}
                    >
                      <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className='text-xs'>{t.addToCart}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6">🔍</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3" style={{ color: colors.secondary }}>{t.noResults}</h3>
              <p className="text-sm sm:text-base md:text-lg" style={{ color: colors.secondary + 'CC' }}>{t.tryDifferent}</p>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div 
        id='about' 
        ref={el => categoryRefs.current['about'] = el}
        data-category-id="about"
        className="text-white py-8 sm:py-12 md:py-16 border-t" 
        style={{ backgroundColor: colors.background, borderColor: colors.accent }}
      >
        {visibleCategories.has('about') ? (
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: colors.text }}>
                {restaurant.name}
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 font-medium" style={{ color: colors.secondary }}>
                {restaurant.tagline}
              </p>
              <p className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 opacity-90" style={{ color: colors.text }}>
                {restaurant.description}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                {hero.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-all duration-300 hover:scale-105" 
                    style={{ 
                      backgroundColor: colors.cardBg,
                      borderColor: colors.accent
                    }}
                  >
                    <span className="text-xs sm:text-sm" style={{ color: colors.secondary }}>✓</span>
                    <span className="text-xs sm:text-sm font-medium" style={{ color: colors.text }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin" style={{ color: colors.secondary }} />
            </div>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div 
        id='contact' 
        ref={el => categoryRefs.current['contact'] = el}
        data-category-id="contact"
        className="text-white py-8 sm:py-12 md:py-16 border-t" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.accent }}
      >
        {visibleCategories.has('contact') ? (
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text }}>
                {t.contactUs}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
              <div 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 rounded-xl border transition-all duration-300 hover:scale-105" 
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent
                }}
              >
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2} style={{ color: colors.secondary }} />
                <div className="text-center">
                  <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
                    الهاتف / Phone
                  </p>
                  <p className="text-base sm:text-lg font-bold" style={{ color: colors.text }}>
                    {restaurant.phone}
                  </p>
                </div>
              </div>
              
              <div 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 rounded-xl border transition-all duration-300 hover:scale-105" 
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent
                }}
              >
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2} style={{ color: colors.secondary }} />
                <div className="text-center">
                  <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
                    الموقع / Location
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: colors.text }}>
                    {restaurant.location}
                  </p>
                </div>
              </div>
              
              <div 
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 rounded-xl border transition-all duration-300 hover:scale-105 sm:col-span-2 md:col-span-1" 
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent
                }}
              >
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2} style={{ color: colors.secondary }} />
                <div className="text-center">
                  <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
                    {t.openingHours}
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: colors.text }}>
                    {t.dailyHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin" style={{ color: colors.secondary }} />
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}