'use client'
import React, { useState, createContext, useContext, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const { data: session } = useSession();

  // جلب رقم الواتساب من الـ API
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const response = await fetch('/api/data?collection=whatsapp');
        const data = await response.json();
        
        let whatsappData = null;
        if (data.whatsapp && Array.isArray(data.whatsapp) && data.whatsapp.length > 0) {
          whatsappData = data.whatsapp[0];
        } else if (Array.isArray(data) && data.length > 0) {
          whatsappData = data[0];
        }
        
        if (whatsappData?.whatsApp) {
          // إزالة علامة + والمسافات
          const cleanNumber = whatsappData.whatsApp.replace(/[+\s]/g, '');
          setWhatsappNumber(cleanNumber);
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
        // رقم افتراضي في حالة فشل الـ API
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const showNotification = (messageAr, messageEn, type = 'success') => {
    setNotification({ 
      messageAr, 
      messageEn, 
      type 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const extractPrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
      const englishNumbers = '0123456789';
      
      let cleanPrice = '';
      for (let char of price) {
        const arabicIndex = arabicNumbers.indexOf(char);
        if (arabicIndex !== -1) {
          cleanPrice += englishNumbers[arabicIndex];
        } else if (englishNumbers.includes(char) || char === '.') {
          cleanPrice += char;
        }
      }
      
      return parseFloat(cleanPrice) || 0;
    }
    return 0;
  };

  useEffect(() => {
    const loadCart = async () => {
      if (session?.user?.name) {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        
        if (localCart.length > 0) {
          try {
            for (const item of localCart) {
              await fetch('/api/data?collection=cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: session.user.name,
                  item: item,
                  quantity: item.quantity,
                  createdAt: new Date().toISOString()
                }),
              });
            }
            localStorage.removeItem('guestCart');
          } catch (error) {
            console.error('Error transferring cart from localStorage:', error);
          }
        }

        try {
          const response = await fetch('/api/data?collection=cart');
          const data = await response.json();
          
          let cartArray = [];
          if (data.cart && Array.isArray(data.cart)) {
            cartArray = data.cart;
          } else if (Array.isArray(data)) {
            cartArray = data;
          }

          const userCartItems = cartArray.filter(item => item.name === session.user.name);
          
          const groupedItems = {};
          userCartItems.forEach(cartItem => {
            const itemId = cartItem.item.id;
            if (groupedItems[itemId]) {
              groupedItems[itemId].quantity += cartItem.quantity || 1;
              groupedItems[itemId]._ids = [...(groupedItems[itemId]._ids || []), cartItem._id];
            } else {
              groupedItems[itemId] = {
                ...cartItem.item,
                quantity: cartItem.quantity || 1,
                _ids: [cartItem._id]
              };
            }
          });
          
          setCartItems(Object.values(groupedItems));
        } catch (error) {
          console.error('Error loading cart from API:', error);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(localCart);
      }
    };

    loadCart();
  }, [session]);

  const addToCart = async (item) => {
    console.log('Adding to cart:', item);

    // تحديث الـ UI فوراً للسرعة
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    showNotification('تم إضافة المنتج للسلة بنجاح ✓', 'Product added to cart successfully ✓', 'success');

    if (session?.user?.name) {
      try {
        // إضافة للـ API في الخلفية
        const response = await fetch('/api/data?collection=cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: session.user.name,
            item: item,
            quantity: 1,
            createdAt: new Date().toISOString()
          }),
        });
        
        if (!response.ok) {
          console.warn('Failed to save to API');
        }
      } catch (error) {
        console.warn('Error adding to cart API:', error);
      }
    } else {
      // للـ Guest Users - نستخدم localStorage
      try {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = localCart.find(i => i.id === item.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          localCart.push({ ...item, quantity: 1 });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(localCart));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    console.log('Removing from cart:', itemId);
    
    // تحديث الـ UI فوراً
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    
    showNotification('تم حذف المنتج من السلة', 'Product removed from cart', 'warning');

    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        
        let cartArray = [];
        if (data.cart && Array.isArray(data.cart)) {
          cartArray = data.cart;
        } else if (Array.isArray(data)) {
          cartArray = data;
        }

        const itemsToDelete = cartArray.filter(
          item => item.name === session.user.name && item.item.id === itemId
        );
        
        for (const item of itemsToDelete) {
          await fetch(`/api/data?collection=cart&id=${item._id}`, {
            method: 'DELETE'
          });
        }
      } catch (error) {
        console.error('Error removing from cart API:', error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = localCart.filter(item => item.id !== itemId);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    
    // تحديث الـ UI فوراً
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    
    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        
        let cartArray = [];
        if (data.cart && Array.isArray(data.cart)) {
          cartArray = data.cart;
        } else if (Array.isArray(data)) {
          cartArray = data;
        }

        const userItems = cartArray.filter(
          item => item.name === session.user.name && item.item.id === itemId
        );
        
        for (const item of userItems) {
          await fetch(`/api/data?collection=cart&id=${item._id}`, {
            method: 'DELETE'
          });
        }
        
        const cartItem = cartItems.find(item => item.id === itemId);
        if (cartItem) {
          await fetch('/api/data?collection=cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: session.user.name,
              item: cartItem,
              quantity: newQuantity,
              updatedAt: new Date().toISOString()
            }),
          });
        }
      } catch (error) {
        console.error('Error updating cart API:', error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = localCart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const clearCart = async () => {
    // تحديث الـ UI فوراً
    setCartItems([]);
    showNotification('تم إفراغ السلة', 'Cart cleared', 'info');
    
    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        
        let cartArray = [];
        if (data.cart && Array.isArray(data.cart)) {
          cartArray = data.cart;
        } else if (Array.isArray(data)) {
          cartArray = data;
        }

        const userItems = cartArray.filter(item => item.name === session.user.name);
        
        for (const item of userItems) {
          await fetch(`/api/data?collection=cart&id=${item._id}`, {
            method: 'DELETE'
          });
        }
      } catch (error) {
        console.error('Error clearing cart API:', error);
      }
    } else {
      localStorage.removeItem('guestCart');
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = extractPrice(item.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      notification,
      extractPrice,
      currentLanguage,
      setCurrentLanguage,
      whatsappNumber
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartNotification = () => {
  const { notification, currentLanguage } = useCart();

  if (!notification) return null;

  const getColor = (type) => {
    switch(type) {
      case 'success': return '#DAA520';
      case 'warning': return '#CD853F';
      case 'error': return '#8B4513';
      case 'info': return '#DAA520';
      default: return '#DAA520';
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'info': return <CheckCircle size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  const message = currentLanguage === 'ar' ? notification.messageAr : notification.messageEn;

  return (
    <div 
      className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-[100] px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl flex items-center gap-2 border-2 animate-bounce"
      style={{ 
        backgroundColor: getColor(notification.type),
        borderColor: '#8B4513',
        color: 'white',
        minWidth: '200px',
        maxWidth: '90vw',
        boxShadow: '0 10px 40px rgba(218, 165, 32, 0.5)',
        animation: 'slideDown 0.4s ease-out'
      }}
    >
      {getIcon(notification.type)}
      <span className="font-bold text-sm sm:text-base">{message}</span>
    </div>
  );
};

const Cart = ({ language = 'ar' }) => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getTotalPrice,
    extractPrice,
    setCurrentLanguage,
    whatsappNumber
  } = useCart();

  const { data: session } = useSession();
  const [isClosing, setIsClosing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language, setCurrentLanguage]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isCartOpen && !isClosing) return null;

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
      cart: 'السلة',
      emptyCart: 'السلة فارغة',
      addItems: 'أضف منتجات لتبدأ الطلب',
      total: 'الإجمالي',
      currency: 'درهم',
      checkout: 'اطلب الآن',
      clearCart: 'إفراغ السلة',
      remove: 'حذف',
      loginFirst: 'يجب تسجيل الدخول أولاً',
      logout: 'تسجيل خروج',
      confirmLogoutTitle: 'تسجيل الخروج',
      confirmLogoutMessage: 'هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء جلستك وستحتاج إلى تسجيل الدخول مرة أخرى.',
      confirmButton: 'نعم، تسجيل الخروج',
      cancelButton: 'إلغاء'
    },
    en: {
      cart: 'Cart',
      emptyCart: 'Cart is Empty',
      addItems: 'Add items to start ordering',
      total: 'Total',
      currency: 'AED',
      checkout: 'Order Now',
      clearCart: 'Clear Cart',
      remove: 'Remove',
      loginFirst: 'Please login first',
      logout: 'Logout',
      confirmLogoutTitle: 'Logout',
      confirmLogoutMessage: 'Are you sure you want to logout? Your session will end and you will need to login again.',
      confirmButton: 'Yes, Logout',
      cancelButton: 'Cancel'
    }
  };

  const t = translations[language];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut({ callbackUrl: '/' });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleCheckout = async () => {
    if (!session?.user?.name) {
      window.location.href = '/login';
      return;
    }

    // التحقق من وجود رقم واتساب
    if (!whatsappNumber) {
      alert(language === 'ar' ? 'عذراً، رقم الواتساب غير متوفر حالياً' : 'Sorry, WhatsApp number is not available');
      return;
    }

    try {
      const userResponse = await fetch('/api/data?collection=auth');
      const userData = await userResponse.json();
      
      let usersArray = [];
      if (userData.auth && Array.isArray(userData.auth)) {
        usersArray = userData.auth;
      } else if (Array.isArray(userData)) {
        usersArray = userData;
      }

      const currentUser = usersArray.find(u => u.name === session.user.name);
      
      if (!currentUser) {
        alert('خطأ في تحميل بيانات المستخدم');
        return;
      }
let message = `*New Order*\n\n`;
message += `*Customer Information:*\n`;
message += ` *Name:* ${currentUser.name}\n`;
message += ` *Phone:* ${currentUser.phone}\n`;
message += ` *Address:* ${currentUser.address}\n`;

// Add location if available
if (currentUser.location) {
  message += ` *Location:* ${currentUser.location}\n`;
}

message += `*Payment Method:* ${currentUser.paymentMethod === 'cash' ? 'Cash on Delivery ' : 'Visa Card '}\n\n`;
message += `*Products:*\n`;
message += `━━━━━━━━━━━━━━━━\n`;

cartItems.forEach((item, index) => {
  const price = extractPrice(item.price);
  const itemTotal = (price * item.quantity).toFixed(2);
  message += `${index + 1}. *${item.name}*\n`;
  message += `    Quantity: ${item.quantity}\n`;
  message += `    Price: ${itemTotal} AED\n\n`;
});

message += `━━━━━━━━━━━━━━━━\n`;
message += ` *Total Amount: ${getTotalPrice().toFixed(2)} AED*`;
     const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // استخدام location.href بدلاً من window.open للتوافق مع جميع الأجهزة
      window.location.href = whatsappUrl;

      // مسح السلة (سيحدث بعد العودة من الواتساب)
      await clearCart();

      await clearCart();
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  return (
    <>
      {showLogoutModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ 
              animation: 'fadeIn 0.3s ease-in-out',
              zIndex: 200
            }}
            onClick={cancelLogout}
          />
          
          <div 
            className="fixed top-1/2 left-1/2 w-full max-w-md mx-4"
            style={{ 
              zIndex: 201,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="rounded-2xl p-6 sm:p-8 shadow-2xl border-2"
              style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.secondary,
                animation: 'scaleInCenter 0.3s ease-out'
              }}
            >
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ 
                  backgroundColor: colors.primary + '20',
                  border: `3px solid ${colors.primary}`
                }}
              >
                <LogOut size={28} className="sm:w-8 sm:h-8" style={{ color: colors.primary }} />
              </div>
              
              <h3 
                className="text-xl sm:text-2xl font-black text-center mb-3 sm:mb-4"
                style={{ color: colors.text }}
              >
                {t.confirmLogoutTitle}
              </h3>
              
              <p 
                className="text-sm sm:text-base text-center mb-6 sm:mb-8 leading-relaxed"
                style={{ color: colors.secondary }}
              >
                {t.confirmLogoutMessage}
              </p>
              
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={cancelLogout}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 border-2"
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
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg"
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
        </>
      )}

      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        style={{ 
          animation: isClosing ? 'fadeOut 0.3s ease-in-out' : 'fadeIn 0.3s ease-in-out',
          zIndex: 49,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />

      <div 
        className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} h-full w-full sm:max-w-md md:max-w-lg lg:max-w-2xl shadow-2xl`}
        style={{ 
          backgroundColor: colors.background,
          animation: isClosing 
            ? (language === 'ar' ? 'slideOutLeft 0.3s ease-in' : 'slideOutRight 0.3s ease-in')
            : (language === 'ar' ? 'slideInLeft 0.4s ease-out' : 'slideInRight 0.4s ease-out'),
          transform: 'translateX(0)',
          zIndex: 60
        }}
      >
        <div 
          className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b-2"
          style={{ borderColor: colors.secondary + '4D' }}
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-black flex items-center gap-2 sm:gap-3" style={{ color: colors.text }}>
            <ShoppingCart size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: colors.secondary }} />
            {t.cart}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            {session && (
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg hover:scale-110 transition-transform"
                style={{ color: '#ef4444' }}
                title={t.logout}
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-lg hover:scale-110 transition-transform"
              style={{ color: colors.secondary }}
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 cart-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)', paddingBottom: '20px' }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-16 md:py-20">
              <ShoppingCart size={60} className="sm:w-20 sm:h-20 mb-3 sm:mb-4 opacity-30" style={{ color: colors.secondary }} />
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.text }}>{t.emptyCart}</h3>
              <p className="text-sm sm:text-base" style={{ color: colors.secondary + 'CC' }}>{t.addItems}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {cartItems.map(item => (
                <div 
                  key={item.id}
                  className="flex flex-col p-2 sm:p-3 rounded-xl border-2"
                  style={{ 
                    backgroundColor: colors.cardBg,
                    borderColor: colors.accent + '4D',
                    animation: 'scaleIn 0.3s ease-out'
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-24 sm:h-32 rounded-lg object-cover border-2 mb-2"
                    style={{ borderColor: colors.secondary }}
                  />
                  <h4 className="font-bold text-sm sm:text-sm mb-1 line-clamp-2" style={{ color: colors.text }}>
                    {item.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs mb-2" style={{ color: colors.secondary }}>
                    {extractPrice(item.price).toFixed(2)} {item.currency || 'درهم'}
                  </p>
                  <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-0.5 sm:p-1 rounded-lg border-2 hover:scale-110 transition-transform"
                        style={{ 
                          borderColor: colors.secondary,
                          color: colors.secondary
                        }}
                      >
                        <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="font-bold text-xs sm:text-sm w-5 sm:w-6 text-center" style={{ color: colors.text }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-0.5 sm:p-1 rounded-lg border-2 hover:scale-110 transition-transform"
                        style={{ 
                          borderColor: colors.secondary,
                          color: colors.secondary
                        }}
                      >
                        <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg hover:scale-110 transition-transform"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div 
            className="absolute bottom-0 left-0 right-0 p-6 border-t-2 space-y-4"
            style={{ 
              borderColor: colors.secondary + '4D',
              backgroundColor: colors.background
            }}
          >
            <div className="flex justify-between items-center text-2xl font-black">
              <span style={{ color: colors.text }}>{t.total}:</span>
              <span style={{ color: colors.secondary }}>
                {getTotalPrice().toFixed(2)} {language === 'ar' ? 'درهم' : 'AED'}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              {t.checkout}
            </button>
            <button
              onClick={clearCart}
              className="w-full py-3 rounded-xl font-bold border-2 hover:scale-105 transition-transform"
              style={{ 
                borderColor: colors.secondary,
                color: colors.secondary
              }}
            >
              {t.clearCart}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        
        @keyframes slideOutLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleInCenter {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
};

export default Cart;