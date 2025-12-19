'use client';

import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const UmKhaterRestaurant = () => {
  const [data, setData] = useState(null);
  const [language, setLanguage] = useState('ar');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Fetch data from API (replace with your actual API URL)
    const fetchData = async () => {
      try {
        // Replace this URL with your actual API endpoint
        const response = await fetch('https://api.example.com/restaurant-data');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        // Fallback to embedded data if API fails
        setData(FALLBACK_DATA);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data?.heroSlider?.settings?.autoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => 
          (prev + 1) % data.heroSlider.slides.length
        );
      }, data.heroSlider.settings.interval);
      return () => clearInterval(interval);
    }
  }, [data]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % data.heroSlider.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      (prev - 1 + data.heroSlider.slides.length) % data.heroSlider.slides.length
    );
  };

  const getAllItems = () => {
    if (!data) return [];
    return data.categories.flatMap(cat => 
      cat.items.map(item => ({ ...item, categoryId: cat.id }))
    );
  };

  const getFilteredItems = () => {
    let items = getAllItems();
    
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.categoryId === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item[language].name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8DC]">
        <div className="text-2xl text-[#8B4513]">جاري التحميل...</div>
      </div>
    );
  }

  const t = data.restaurant[language];
  const hero = data.hero[language];
  const currentSlideData = data.heroSlider.slides[currentSlide];
  const filteredItems = getFilteredItems();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-[#FFF8DC] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-[#8B4513] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t.name}</h1>
              <p className="text-sm md:text-base text-[#D4AF37]">{t.tagline}</p>
            </div>
            <button
              onClick={toggleLanguage}
              className="bg-[#D4AF37] text-[#8B4513] px-4 py-2 rounded-lg font-bold hover:bg-[#C41E3A] hover:text-white transition-all"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{t.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{t.location}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {data.heroSlider.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide[language].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="container mx-auto px-4 h-full flex items-end pb-12">
                <div className="text-white max-w-2xl">
                  <span className="bg-[#C41E3A] px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
                    {slide[language].badge}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide[language].title}
                  </h2>
                  <p className="text-lg md:text-xl mb-6">
                    {slide[language].description}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#D4AF37] text-[#8B4513] px-6 py-3 rounded-lg font-bold text-xl">
                      {slide[language].price} {slide[language].currency}
                    </div>
                    {slide[language].oldPrice && (
                      <div className="text-white/70 line-through text-lg">
                        {slide[language].oldPrice} {slide[language].currency}
                      </div>
                    )}
                    <div className="bg-[#C41E3A] px-4 py-2 rounded-lg font-bold">
                      {slide[language].offer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {data.heroSlider.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-[#D4AF37] w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#8B4513] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hero.features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-[#D4AF37] text-xl font-bold">✓</div>
                <div className="mt-2">{feature}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[#8B4513]`} />
            <input
              type="text"
              placeholder={isRTL ? 'ابحث عن طبق...' : 'Search for a dish...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-[#8B4513] rounded-lg focus:outline-none focus:border-[#D4AF37]`}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#8B4513] text-white'
                  : 'bg-white text-[#8B4513] border-2 border-[#8B4513]'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            {data.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#8B4513] text-white'
                    : 'bg-white text-[#8B4513] border-2 border-[#8B4513]'
                }`}
              >
                {cat[language].name}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item[language].name}
                  className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                />
                <img
                  src={item.hoverImage}
                  alt={item[language].name}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute top-2 right-2 bg-[#C41E3A] text-white px-3 py-1 rounded-full text-sm font-bold">
                  {item[language].price} {item[language].currency}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-[#8B4513] mb-2">
                  {item[language].name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {item[language].description}
                </p>
                <p className="text-gray-500 text-xs italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item[language].hoverDescription}
                </p>
                <button className="w-full mt-4 bg-[#8B4513] text-white py-2 rounded-lg font-bold hover:bg-[#D4AF37] hover:text-[#8B4513] transition-all">
                  {hero.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-[#8B4513]">
              {isRTL ? 'لا توجد نتائج' : 'No results found'}
            </p>
          </div>
        )}
      </section>

      {/* Categories Showcase */}
      <section className="bg-[#8B4513] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            {isRTL ? 'تصفح قائمتنا' : 'Browse Our Menu'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={cat.image}
                  alt={cat[language].name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-xl mb-1">
                    {cat[language].name}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {cat[language].description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C1810] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">{t.name}</h3>
          <p className="text-[#D4AF37] mb-4">{t.description}</p>
          <div className="flex justify-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{t.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{t.location}</span>
            </div>
          </div>
          <p className="text-sm text-white/60">
            © 2024 {t.name}. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UmKhaterRestaurant;
