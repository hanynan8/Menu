'use client'
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Phone, MapPin, Clock, Star, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from './components/cart';
import { useSession } from 'next-auth/react';
import Navbar from './components/navbar';


export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(result => {
        setData(result.Menu[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
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

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: '#1A1410' }}
      >
        {/* دائرة Loading فقط بدون أي كلام */}
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #2D2420',
          borderTop: '6px solid #DAA520',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1410' }}>
        <div className="text-2xl font-bold text-red-400">
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

  const categoryIcons = {
    mahashi: '🫔',
    manakeesh: '🫓',
    desserts: '🍰',
    yakhniyat: '🍲',
    rice_dishes: '🍚',
    grills: '🍖',
    appetizers: '🥗',
    pastries: '🥐'
  };

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
      orderNow: 'اطلب الآن',
      contactUs: 'تواصل معنا',
      noResults: 'لم نجد نتائج',
      tryDifferent: 'جرب البحث بكلمات أخرى أو اختر تصنيف مختلف',
      normalPrice: 'السعر العادي',
      openingHours: 'ساعات العمل',
      dailyHours: 'يومياً من 10 صباحاً - 12 منتصف الليل',
      addToCart: 'أضف للسلة'
    },
    en: {
      allCategories: 'All Categories',
      searchPlaceholder: 'Search for your favorite dish...',
      orderNow: 'Order Now',
      contactUs: 'Contact Us',
      noResults: 'No Results Found',
      tryDifferent: 'Try different keywords or select another category',
      normalPrice: 'Regular Price',
      openingHours: 'Opening Hours',
      dailyHours: 'Daily 10 AM - 12 Midnight',
      addToCart: 'Add to Cart'
    }
  };

  const t = translations[language];

  const handleAddToCart = async (item) => {
    const cartItem = {
      id: item.id,
      name: item[language].name,
      price: item[language].price,
      currency: item[language].currency,
      image: item.image
    };

    addToCart(cartItem);

    if (session?.user?.email) {
      try {
        await fetch('https://menu-2ypb.vercel.app/api/data?collection=cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            item: cartItem,
            quantity: 1,
            addedAt: new Date().toISOString()
          }),
        });
      } catch (error) {
        console.error('Error adding to cart API:', error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItemIndex = localCart.findIndex(i => i.id === cartItem.id);
      
      if (existingItemIndex > -1) {
        localCart[existingItemIndex].quantity += 1;
      } else {
        localCart.push({ ...cartItem, quantity: 1 });
      }
      
      localStorage.setItem('guestCart', JSON.stringify(localCart));
    }
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen" style={{ backgroundColor: colors.background }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="relative h-[700px] overflow-hidden">
        {heroSlider.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            
            <img
              src={slide.image}
              alt={slide[language].title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-6 lg:px-12">
                <div className={`max-w-4xl ${language === 'ar' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                  
                  <div className={`mb-8 ${language === 'ar' ? 'pr-4 sm:pr-8 md:pr-12 lg:pr-16 xl:pr-20' : 'pl-4 sm:pl-8 md:pl-12 lg:pl-16 xl:pl-20'}`}>
                    <div 
                      className="inline-flex items-center gap-2 backdrop-blur-sm px-2 py-1 rounded-full mb-4 shadow-md border"
                      style={{ 
                        backgroundColor: colors.primary + 'CC',
                        borderColor: colors.accent + '60'
                      }}
                    >
                      <Star className="w-4 h-4 fill-current animate-pulse" style={{ color: 'white' }} />
                      <span className="font-medium" style={{ color: 'white' }}>
                        {slide[language].badge}
                      </span>
                    </div>
                    
                    <h1 
                      className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent w-full mb-2 leading-tight drop-shadow-2xl pb-5"
                    >
                      {slide[language].title}
                    </h1>
                    
                    <p 
                      className="text-base md:text-lg lg:text-xl mb-8 leading-relaxed max-w-2xl font-medium drop-shadow-md"
                      style={{ color: colors.text + 'E6' }}
                    >
                      {slide[language].description}
                    </p>
                  
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      
                      <button
                        className="group relative text-white px-2 py-2 rounded-full text-base font-bold shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden border"
                        style={{ 
                          backgroundColor: colors.primary + 'E6',
                          borderColor: colors.accent + '30'
                        }}
                      >
                        <span className="relative z-10 flex font-normal items-center gap-2">
                          {hero.cta}
                          <span className={`text-xl transition-transform duration-300 ${language === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
                            {language === 'ar' ? '←' : '→'}
                          </span>
                        </span>
                        <div 
                          className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                          style={{ backgroundColor: colors.accent + '30' }}
                        ></div>
                      </button>
                      
                      <div 
                        className="inline-flex items-center gap-4 backdrop-blur-sm px-2 py-2 rounded-full shadow-md border"
                        style={{
                          borderColor: colors.accent + '60'
                        }}
                      >
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-normal font-black" style={{ color: colors.secondary }}>
                            {slide[language].price}
                          </span>
                          <span className="text-lg font-normal" style={{ color: colors.text }}>
                            {slide[language].currency}
                          </span>
                        </div>
                        
                        <div className="h-6 w-px" style={{ backgroundColor: colors.accent + '60' }}></div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs font-medium opacity-80" style={{ color: colors.text }}>
                            {t.normalPrice}
                          </span>
                          <span className="text-base font-bold line-through opacity-60" style={{ color: colors.text }}>
                            {slide[language].oldPrice}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
{/* Previous Button - يسار في الإنجليزي، يمين في العربي */}
      <button
        onClick={prevSlide}
        className={`absolute ${language === 'ar' ? 'right-4 md:right-8' : 'left-4 md:left-8'} top-1/2 -translate-y-1/2 z-30 group`}
        aria-label={language === 'ar' ? 'الشريحة السابقة' : 'Previous slide'}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          
          <div 
            className="relative p-3 md:p-4 rounded-full transition-all duration-300 shadow-2xl group-hover:shadow-amber-500/50 group-hover:scale-110 border-2 border-amber-400/40 backdrop-blur-md"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}E6, ${colors.secondary}E6)`,
            }}
          >
            {language === 'ar' ? (
              <ChevronRight size={24} strokeWidth={3} className="text-white group-hover:text-amber-100 transition-colors duration-300 md:w-7 md:h-7" />
            ) : (
              <ChevronLeft size={24} strokeWidth={3} className="text-white group-hover:text-amber-100 transition-colors duration-300 md:w-7 md:h-7" />
            )}
          </div>
        </div>
      </button>

      {/* Next Button - يمين في الإنجليزي، يسار في العربي */}
      <button
        onClick={nextSlide}
        className={`absolute ${language === 'ar' ? 'left-4 md:left-8' : 'right-4 md:right-8'} top-1/2 -translate-y-1/2 z-30 group`}
        aria-label={language === 'ar' ? 'الشريحة التالية' : 'Next slide'}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          
          <div 
            className="relative p-3 md:p-4 rounded-full transition-all duration-300 shadow-2xl group-hover:shadow-amber-500/50 group-hover:scale-110 border-2 border-amber-400/40 backdrop-blur-md"
            style={{ 
              background: `linear-gradient(135deg, ${colors.secondary}E6, ${colors.primary}E6)`,
            }}
          >
            {language === 'ar' ? (
              <ChevronLeft size={24} strokeWidth={3} className="text-white group-hover:text-amber-100 transition-colors duration-300 md:w-7 md:h-7" />
            ) : (
              <ChevronRight size={24} strokeWidth={3} className="text-white group-hover:text-amber-100 transition-colors duration-300 md:w-7 md:h-7" />
            )}
          </div>
        </div>
      </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {heroSlider.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-4 h-4 shadow-lg' 
                  : 'w-3 h-3 opacity-30 hover:opacity-60 hover:scale-110'
              }`}
              style={{
                backgroundColor: colors.secondary
              }}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>



      <div className="sticky top-0 z-40 shadow-lg border-b-2" style={{ backgroundColor: colors.cardBg, borderColor: colors.secondary + '80' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <div className={`w-full lg:w-80 flex-shrink-0 ${language === 'ar' ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="relative h-full">
                <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} style={{ color: colors.secondary }} size={18} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-full ${language === 'ar' ? 'pr-11 pl-3' : 'pl-11 pr-3'} py-2.5 rounded-lg border-2 focus:outline-none text-sm font-medium`}
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
            </div>

            <div id='menu' className={`flex-1 ${language === 'ar' ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 shadow-md border ${
                    selectedCategory === 'all' ? 'scale-105' : 'hover:scale-105'
                  }`}
                  style={selectedCategory === 'all' ? { 
                    backgroundColor: colors.primary,
                    color: 'white',
                    borderColor: colors.secondary
                  } : {
                    backgroundColor: colors.background,
                    color: colors.secondary,
                    borderColor: colors.accent
                  }}
                >
                  🍽️ {t.allCategories}
                </button>
                {data.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 shadow-md border ${
                      selectedCategory === cat.id ? 'scale-105' : 'hover:scale-105'
                    }`}
                    style={selectedCategory === cat.id ? { 
                      backgroundColor: colors.primary,
                      color: 'white',
                      borderColor: colors.secondary
                    } : {
                      backgroundColor: colors.background,
                      color: colors.secondary,
                      borderColor: colors.accent
                    }}
                  >
                    {/* {cat.image ? (
                      <img src={cat.image} alt={cat[language].name} className="w-6 h-6 rounded-full object-cover border" style={{ borderColor: colors.secondary }} />
                    ) : (
                      <span className="text-lg">{categoryIcons[cat.id] || '🍴'}</span>
                    )} */}
                    <span className="whitespace-nowrap">{cat[language].name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background pattern */}
      <div className="relative container mx-auto px-6 py-16">
{/* استبدل الـ div القديم بهذا */}
<div className="absolute inset-0 pointer-events-none">
  <svg
    className="w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      {/* عدّل width/height لتكبر/تصغر الشبكة */}
      <pattern id="islamicPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <g
          fill="none"
          stroke={colors.secondary}      // لون الخط - يستخدم قيمة colors.secondary
          strokeWidth="2"                // سمك الخط
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* صليب/شكل متقاطع في مركز الخلية */}
          <path d="M15 4v7 M15 19v7 M4 15h7 M19 15h7" />
          {/* نقطة/مربع صغير في الوسط للخامة */}
          <circle cx="15" cy="15" r="2" fill={colors.secondary} />
        </g>
      </pattern>
    </defs>

    {/* مستطيل يملأ العنصر بالنمط — عدّل opacity للشفافية */}
    <rect width="100%" height="100%" fill="url(#islamicPattern)" opacity="0.12" />
  </svg>
</div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {filteredItems.map(item => (
            <div
  key={item.id}
  className="group rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-3 transition-all duration-500 border-2 cursor-pointer flex flex-col"
  style={{ 
    backgroundColor: colors.cardBg,
    borderColor: (hoveredItem === item.id || clickedItem === item.id) ? colors.secondary + '99' : colors.accent + '4D'
  }}
  onMouseEnter={() => setHoveredItem(item.id)}
  onMouseLeave={() => setHoveredItem(null)}
  onClick={() => setClickedItem(clickedItem === item.id ? null : item.id)}
>
  <div className="relative h-72 overflow-hidden flex-shrink-0">
    {/* الصورة والمحتوى بتاعها زي ما هو */}
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
    
    <div className="absolute inset-0 group-hover:bg-black/20 transition-all duration-500 z-10" />
    
    <div className="absolute inset-0 flex items-end p-6 z-20">
      <p className={`text-amber-100 text-sm font-medium leading-relaxed transition-all duration-500 ${
        (hoveredItem === item.id || clickedItem === item.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {item[language].hoverDescription}
      </p>
    </div>
  </div>

  <div className="p-6 flex flex-col flex-grow">
    <h3 className="text-2xl font-black mb-3 transition-all duration-300 bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
      {item[language].name}
    </h3>
    <p className="text-sm mb-5 leading-relaxed flex-grow" style={{ color: colors.secondary + 'CC' }}>
      {item[language].description}
    </p>
    <div className="flex items-center justify-between gap-3 mt-auto">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-normal font-black" style={{ color: colors.secondary }}>{item[language].price}</span>
        <span className="text-sm font-bold" style={{ color: colors.secondary + 'CC' }}>{item[language].currency}</span>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart(item);
        }}
        className="flex items-center gap-2 text-white px-2 py-1 rounded-xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 border whitespace-nowrap text-sm" 
        style={{ backgroundColor: colors.primary, borderColor: colors.secondary + '4D' }}
      >
        <ShoppingCart size={10} />
        <span className='text-xs'>{t.addToCart}</span>
      </button>
</div>
</div>
    </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-black mb-3" style={{ color: colors.secondary }}>{t.noResults}</h3>
            <p className="text-lg" style={{ color: colors.secondary + 'CC' }}>{t.tryDifferent}</p>
          </div>
        )}
      </div>

      
<div id='about' className="text-white py-16 border-t" style={{ backgroundColor: colors.background, borderColor: colors.accent }}>
  <div className="container mx-auto px-6">
    <div className="text-center max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-3" style={{ color: colors.text }}>
        {restaurant.name}
      </h2>
      <p className="text-xl mb-4 font-medium" style={{ color: colors.secondary }}>
        {restaurant.tagline}
      </p>
      <p className="text-base leading-relaxed mb-8 opacity-90" style={{ color: colors.text }}>
        {restaurant.description}
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        {hero.features.map((feature, index) => (
          <div 
            key={index} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105" 
            style={{ 
              backgroundColor: colors.cardBg,
              borderColor: colors.accent
            }}
          >
            <span className="text-sm" style={{ color: colors.secondary }}>✓</span>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

<div id='contact' className="text-white py-16 border-t" style={{ backgroundColor: colors.cardBg, borderColor: colors.accent }}>
  <div className="container mx-auto px-6">
    <div className="text-center mb-10">
      <h3 className="text-3xl font-bold" style={{ color: colors.text }}>
        {t.contactUs}
      </h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <div 
        className="flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 hover:scale-105" 
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.accent
        }}
      >
        <Phone className="w-8 h-8" strokeWidth={2} style={{ color: colors.secondary }} />
        <div className="text-center">
          <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
            الهاتف / Phone
          </p>
          <p className="text-lg font-bold" style={{ color: colors.text }}>
            {restaurant.phone}
          </p>
        </div>
      </div>
      
      <div 
        className="flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 hover:scale-105" 
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.accent
        }}
      >
        <MapPin className="w-8 h-8" strokeWidth={2} style={{ color: colors.secondary }} />
        <div className="text-center">
          <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
            الموقع / Location
          </p>
          <p className="text-base font-bold" style={{ color: colors.text }}>
            {restaurant.location}
          </p>
        </div>
      </div>
      
      <div 
        className="flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 hover:scale-105" 
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.accent
        }}
      >
        <Clock className="w-8 h-8" strokeWidth={2} style={{ color: colors.secondary }} />
        <div className="text-center">
          <p className="text-xs font-medium mb-1 uppercase" style={{ color: colors.secondary }}>
            {t.openingHours}
          </p>
          <p className="text-base font-bold" style={{ color: colors.text }}>
            {t.dailyHours}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
</>

  );
}