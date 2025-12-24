'use client';

import { useState } from 'react';
import { Database, Settings, Menu, Navigation, Info, BookOpen, ChevronDown, ChevronUp, Image, Upload, Link2, CheckCircle, AlertCircle } from 'lucide-react';

// استيراد المكونات الحقيقية
import NavbarAdmin from './components/navbar';
import FooterAdmin from './components/footer';
import MenuAdmin from './components/menu';

export default function RestaurantAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [expandedGuide, setExpandedGuide] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Adminuk333') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة السر غير صحيحة');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #DAA520, #CD853F, #8B4513)'
      }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-4" style={{ borderColor: '#8B4513' }}>
          <div className="text-center mb-8">
            <Database className="mx-auto mb-4 animate-pulse" size={64} style={{ color: '#DAA520' }} />
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B4513' }}>
              لوحة تحكم لمطبخ أم خاطر
            </h1>
            <p className="text-gray-600">الرجاء إدخال كلمة السر للدخول</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-right mb-2 font-semibold" style={{ color: '#8B4513' }}>
                كلمة السر
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl text-right focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: error ? '#ef4444' : '#DAA520',
                  focusRing: '#CD853F'
                }}
                placeholder="أدخل كلمة السر"
                dir="ltr"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-right">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #DAA520, #CD853F)'
              }}
            >
              دخول
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2" style={{ borderColor: '#DAA520' }}>
            <p className="text-xs text-center font-semibold opacity-70" style={{ color: '#8B4513' }}>Developed by</p>
            <p className="text-lg text-center font-light tracking-wide mt-1" style={{ 
              color: '#CD853F',
              fontFamily: "'Great Vibes', 'Allura', cursive"
            }}>
              Hany Younan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'menu', name: 'Menu', icon: Menu, component: MenuAdmin },
    { id: 'navbar', name: 'Navbar', icon: Navigation, component: NavbarAdmin },
    { id: 'footer', name: 'Footer', icon: Info, component: FooterAdmin }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MenuAdmin;

  const userGuides = [
    {
      id: 'navbar',
      title: '📌 دليل التعديل على Navbar (شريط التنقل)',
      icon: Navigation,
      color: 'blue',
      steps: [
        {
          title: '1️⃣ تعديل الشعار (Logo)',
          content: [
            '✅ اضغط على زر "تعديل" في بطاقة Navbar',
            '✅ ابحث عن حقل "logo" → "image_url"',
            '✅ الصق رابط الصورة الجديدة (شوف خطوات رفع الصور أسفل)',
            '✅ يمكنك تعديل اسم المطبخ في حقل "name"',
            '⚠️ تأكد من رفع الصورة أولاً على GitHub (شوف القسم الأصفر أسفل)'
          ]
        },
        {
          title: '2️⃣ تعديل عناصر القائمة',
          content: [
            '✅ افتح قسم "menu_items"',
            '✅ كل عنصر له: عنوان (title)، رابط (link)',
            '✅ لتعديل اسم القسم: غيّر حقل "title"',
            '✅ لتغيير الرابط: عدّل حقل "link"',
            '❌ لا تحذف حقل "id" أبداً!'
          ]
        },
        {
          title: '3️⃣ النسخة العربية والإنجليزية',
          content: [
            '🇸🇦 قسم "ar" للنسخة العربية',
            '🇬🇧 قسم "en" للنسخة الإنجليزية',
            '⚠️ تأكد من تعديل النسختين معاً',
            '✅ احفظ التعديلات بالضغط على "حفظ التعديلات"'
          ]
        }
      ]
    },
    {
      id: 'menu',
      title: '🍽️ دليل التعديل على Menu (قائمة الطعام)',
      icon: Menu,
      color: 'green',
      steps: [
        {
          title: '1️⃣ إضافة طبق جديد',
          content: [
            '✅ اختر الفئة المطلوبة من الأزرار العلوية (مثلاً: المحاشي، الحلويات)',
            '✅ اضغط على زر "إضافة طبق جديد"',
            '✅ املأ البيانات بالعربي: الاسم، السعر، الوصف',
            '✅ املأ البيانات بالإنجليزي: Name, Price, Description',
            '✅ أضف رابط الصورة الرئيسية (image)',
            '✅ أضف رابط صورة التمرير (hoverImage) - اختياري',
            '✅ اضغط "إضافة الطبق"'
          ]
        },
        {
          title: '2️⃣ تعديل طبق موجود',
          content: [
            '✅ ابحث عن الطبق في القائمة',
            '✅ اضغط على زر "تعديل"',
            '✅ عدّل البيانات المطلوبة',
            '✅ لا تنسى تعديل النسخة العربية والإنجليزية',
            '✅ اضغط "حفظ التعديلات"'
          ]
        },
        {
          title: '3️⃣ حذف طبق',
          content: [
            '⚠️ احذر! الحذف نهائي',
            '✅ اضغط على زر "حذف" بجانب الطبق',
            '✅ أكد الحذف من النافذة المنبثقة',
            '❌ لا يمكن التراجع عن الحذف'
          ]
        },
        {
          title: '4️⃣ تعديل معلومات المطبخ',
          content: [
            '✅ اضغط على تبويب "معلومات المطبخ"',
            '✅ عدّل: الاسم، الشعار، الوصف، الهاتف، الموقع',
            '✅ عدّل النسخة العربية والإنجليزية',
            '✅ اضغط "حفظ معلومات المطبخ"'
          ]
        },
        {
          title: '5️⃣ تعديل Hero Slider (السلايدر الرئيسي)',
          content: [
            '✅ اضغط على تبويب "Hero Slider"',
            '✅ كل سلايد له: صورة، عنوان، وصف، سعر، عرض',
            '✅ عدّل البيانات العربية والإنجليزية لكل سلايد',
            '✅ اضغط "حفظ Hero Slider"'
          ]
        }
      ]
    },
    {
      id: 'footer',
      title: '🔽 دليل التعديل على Footer (الفوتر)',
      icon: Info,
      color: 'purple',
      steps: [
        {
          title: '1️⃣ تعديل قسم "عن المطبخ"',
          content: [
            '✅ اضغط على زر "تعديل"',
            '✅ ابحث عن قسم "about"',
            '✅ عدّل العنوان (title) والوصف (description)',
            '✅ عدّل النسخة العربية (ar) والإنجليزية (en)',
            '✅ اضغط "حفظ التعديلات"'
          ]
        },
        {
          title: '2️⃣ تعديل الروابط السريعة',
          content: [
            '✅ افتح قسم "quickLinks"',
            '✅ كل رابط له: اسم (name) ورابط (url)',
            '✅ لتعديل اسم الرابط: غيّر حقل "name"',
            '✅ لتغيير العنوان: عدّل حقل "url"',
            '⚠️ تأكد من صحة الروابط قبل الحفظ'
          ]
        },
        {
          title: '3️⃣ تعديل معلومات التواصل',
          content: [
            '✅ افتح قسم "contact"',
            '✅ عدّل: الهاتف (phone)، البريد (email)، الموقع (location)',
            '✅ عدّل ساعات العمل (hours)',
            '✅ تأكد من كتابة الأرقام بشكل صحيح'
          ]
        },
        {
          title: '4️⃣ تعديل روابط التواصل الاجتماعي',
          content: [
            '✅ افتح قسم "social" → "platforms"',
            '✅ كل منصة لها: اسم، أيقونة، رابط',
            '✅ عدّل حقل "url" لتغيير الرابط',
            '⚠️ تأكد من صحة روابط الحسابات'
          ]
        },
        {
          title: '5️⃣ تعديل حقوق النشر',
          content: [
            '✅ ابحث عن حقل "copyright"',
            '✅ عدّل النص كما تريد',
            '✅ عدّل النسخة العربية والإنجليزية',
            '✅ احفظ التعديلات'
          ]
        }
      ]
    }
  ];

  const imageUploadGuide = {
    title: '📸 خطوات رفع الصور بشكل صحيح',
    steps: [
      {
        step: '1',
        title: 'تصغير حجم الصورة',
        icon: Image,
        color: 'bg-yellow-500',
        details: [
          '🌐 افتح موقع TinyPNG: https://tinypng.com',
          '📤 ارفع الصورة على الموقع',
          '⏳ انتظر حتى ينتهي الضغط',
          '💾 حمّل الصورة المضغوطة على جهازك',
          '✅ الصورة الآن جاهزة للرفع!'
        ]
      },
      {
        step: '2',
        title: 'رفع الصورة على GitHub',
        icon: Upload,
        color: 'bg-blue-500',
        details: [
          '🌐 افتح GitHub Repository الخاص بالصور',
          '📁 اختر المجلد المناسب (مثلاً: menu-images)',
          '➕ اضغط على "Add file" → "Upload files"',
          '📤 اسحب الصورة أو اختارها من جهازك',
          '💬 اكتب رسالة Commit (مثلاً: "Add new dish image")',
          '✅ اضغط "Commit changes"'
        ]
      },
      {
        step: '3',
        title: 'الحصول على رابط الصورة',
        icon: Link2,
        color: 'bg-green-500',
        details: [
          '👆 اضغط على الصورة في GitHub',
          '🖱️ اضغط بالزر الأيمن على الصورة',
          '📋 اختر "Copy image address" أو "نسخ عنوان الصورة"',
          '✅ الرابط الآن في الحافظة!',
          '📝 الصق الرابط في حقل "image_url" في لوحة التحكم'
        ]
      }
    ]
  };

  const importantNotes = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'نصائح مهمة ✅',
      items: [
        'احفظ نسخة احتياطية قبل التعديل',
        'عدّل النسخة العربية والإنجليزية معاً',
        'تأكد من صحة الروابط قبل الحفظ',
        'استخدم صور بجودة عالية وحجم صغير',
        'جرّب التعديلات في بيئة الاختبار أولاً'
      ]
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'تحذيرات مهمة ⚠️',
      items: [
        'لا تحذف حقول "id" أو "_id" أبداً!',
        'لا تغيّر أسماء الحقول (مثل: name, title, link)',
        'تأكد من رفع الصور قبل إضافة روابطها',
        'الحذف نهائي ولا يمكن التراجع عنه',
        'اضغط "حفظ" بعد كل تعديل'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* استيراد فونت الإمضاء */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Allura&family=Dancing+Script:wght@300;400&display=swap" rel="stylesheet" />
      {/* Header */}
      <div className="shadow-2xl border-b-4" style={{ 
        background: 'linear-gradient(to right, #DAA520, #CD853F, #8B4513)',
        borderColor: '#8B4513'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              <Database className="animate-pulse" size={36} />
              لوحة تحكم لمطبخ أم خاطر
            </h1>
            <div className="text-white text-right flex flex-col items-center">
              <p className="text-xs font-semibold opacity-80">Developed by</p>
              <p className="text-xl font-light tracking-wide" style={{ 
                fontFamily: "'Great Vibes', 'Allura', cursive"
              }}>
                Hany Younan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-4 border-2" style={{ borderColor: '#DAA520' }}>
              <h2 className="text-xl font-bold mb-6 border-b-2 pb-3 flex items-center gap-2" style={{ 
                color: '#8B4513',
                borderColor: '#CD853F'
              }}>
                <Settings size={24} style={{ color: '#DAA520' }} />
                أقسام الموقع
              </h2>
              <div className="space-y-3">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all text-right font-medium shadow-md hover:shadow-lg ${
                        activeTab === tab.id
                          ? 'scale-105 text-white border-2'
                          : 'hover:scale-105 border-2'
                      }`}
                      style={activeTab === tab.id ? {
                        background: 'linear-gradient(to right, #DAA520, #CD853F)',
                        borderColor: '#8B4513'
                      } : {
                        backgroundColor: '#FFF',
                        color: '#8B4513',
                        borderColor: '#CD853F'
                      }}
                    >
                      <Icon size={20} />
                      <span className="flex-1 text-lg">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* معلومات إضافية */}
              <div className="mt-8 p-4 rounded-xl border-2" style={{
                background: 'linear-gradient(to right, #FFF9E6, #FFF5CC)',
                borderColor: '#DAA520'
              }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#8B4513' }}>
                  <Info size={18} />
                  معلومات
                </h3>
                <p className="text-sm" style={{ color: '#666' }}>
                  استخدم هذه اللوحة لإدارة محتوى الموقع بسهولة
                </p>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: '#DAA520' }}>
                  <p className="text-xs text-center font-semibold opacity-70" style={{ color: '#8B4513' }}>Developed by</p>
                  <p className="text-lg text-center font-light tracking-wide mt-1" style={{ 
                    color: '#CD853F',
                    fontFamily: "'Great Vibes', 'Allura', cursive"
                  }}>
                    Hany Younan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ActiveComponent />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* دليل المستخدم الشامل */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* عنوان الدليل */}
        <div className="rounded-2xl shadow-2xl p-8 mb-8 border-4 relative overflow-hidden" style={{
          background: 'linear-gradient(to right, #DAA520, #CD853F)',
          borderColor: '#8B4513'
        }}>
          <div className="flex items-center justify-between gap-4 text-white relative z-10">
            <div className="flex items-center gap-4">
              <BookOpen size={48} className="animate-bounce" />
              <div>
                <h2 className="text-3xl font-bold mb-2">📚 دليل المستخدم الشامل</h2>
                <p className="text-lg opacity-90">تعلم كيفية التعديل على كل جزء من الموقع بسهولة</p>
              </div>
            </div>
            <div className="text-right hidden md:flex md:flex-col md:items-center">
              <p className="text-xs font-semibold opacity-80">Developed by</p>
              <p className="text-2xl font-light tracking-wide" style={{ 
                fontFamily: "'Great Vibes', 'Allura', cursive"
              }}>
                Hany Younan
              </p>
            </div>
          </div>
          {/* Watermark في الخلفية - علامة مائية */}
          <div className="absolute bottom-4 right-4 text-white text-5xl font-light pointer-events-none" style={{
            fontFamily: "'Great Vibes', 'Allura', cursive",
            opacity: 0.08
          }}>
            Hany Younan
          </div>
        </div>

        {/* خطوات رفع الصور - قسم مميز */}
        <div className="rounded-2xl shadow-2xl p-8 mb-8 border-4" style={{
          background: 'linear-gradient(to bottom right, #FFF9E6, #FFF0B3)',
          borderColor: '#DAA520'
        }}>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#8B4513' }}>
            <Image size={32} style={{ color: '#CD853F' }} />
            {imageUploadGuide.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {imageUploadGuide.steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-2 hover:shadow-2xl transition-all" style={{ borderColor: '#DAA520' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg" style={{
                    backgroundColor: step.color === 'bg-yellow-500' ? '#DAA520' : 
                                   step.color === 'bg-blue-500' ? '#CD853F' : '#8B4513'
                  }}>
                    <span className="text-white text-2xl font-bold">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2" style={{ color: '#8B4513' }}>
                    <Icon size={20} />
                    {step.title}
                  </h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-lg">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg p-4 border-2" style={{
            backgroundColor: '#FFF9E6',
            borderColor: '#DAA520'
          }}>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#8B4513' }}>
              <AlertCircle size={20} />
              <strong>مهم جداً:</strong> يجب رفع الصور أولاً على GitHub والحصول على الرابط قبل إضافته في لوحة التحكم!
            </p>
          </div>
        </div>

        {/* أدلة المكونات */}
        <div className="space-y-6">
          {userGuides.map(guide => {
            const GuideIcon = guide.icon;
            const isExpanded = expandedGuide === guide.id;
            const colorClasses = {
              blue: { gradient: 'linear-gradient(to right, #DAA520, #CD853F)', border: '#8B4513' },
              green: { gradient: 'linear-gradient(to right, #8B4513, #A0522D)', border: '#654321' },
              purple: { gradient: 'linear-gradient(to right, #CD853F, #DAA520)', border: '#8B4513' }
            };

            return (
              <div key={guide.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#DAA520' }}>
                <button
                  onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                  className="w-full text-white p-6 flex items-center justify-between hover:opacity-90 transition-all border-b-4"
                  style={{
                    background: colorClasses[guide.color].gradient,
                    borderColor: colorClasses[guide.color].border
                  }}
                >
                  <div className="flex items-center gap-4">
                    <GuideIcon size={32} />
                    <h3 className="text-2xl font-bold">{guide.title}</h3>
                  </div>
                  {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                </button>

                {isExpanded && (
                  <div className="p-8 space-y-6">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="rounded-xl p-6 shadow-lg border-2" style={{
                        background: 'linear-gradient(to bottom right, #FFFFFF, #FFF9E6)',
                        borderColor: '#DAA520'
                      }}>
                        <h4 className="text-xl font-bold mb-4 border-b-2 pb-2" style={{ 
                          color: '#8B4513',
                          borderColor: '#CD853F'
                        }}>
                          {step.title}
                        </h4>
                        <ul className="space-y-2">
                          {step.content.map((item, i) => (
                            <li key={i} className="text-gray-700 flex items-start gap-2">
                              <span className="text-lg">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* نصائح وتحذيرات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {importantNotes.map((note, index) => {
            const NoteIcon = note.icon;
            const bgColor = note.type === 'success' ? 
              'linear-gradient(to bottom right, #E8F5E9, #C8E6C9)' : 
              'linear-gradient(to bottom right, #FFF3E0, #FFE0B2)';
            const borderColor = note.type === 'success' ? '#8B4513' : '#DAA520';
            const iconColor = note.type === 'success' ? '#8B4513' : '#CD853F';
            const titleColor = note.type === 'success' ? '#654321' : '#8B4513';

            return (
              <div key={index} className="rounded-2xl p-6 shadow-lg border-2" style={{
                background: bgColor,
                borderColor: borderColor
              }}>
                <h4 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: titleColor }}>
                  <NoteIcon size={28} style={{ color: iconColor }} />
                  {note.title}
                </h4>
                <ul className="space-y-2">
                  {note.items.map((item, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-lg mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* معلومات الدعم */}
        <div className="rounded-2xl shadow-2xl p-8 mt-8 border-4 relative overflow-hidden" style={{
          background: 'linear-gradient(to right, #8B4513, #A0522D)',
          borderColor: '#654321'
        }}>
          <div className="text-white text-center relative z-10">
            <h3 className="text-2xl font-bold mb-3">💡 هل تحتاج مساعدة؟</h3>
            <p className="text-lg mb-4 opacity-90">
              إذا واجهت أي مشكلة أو كنت بحاجة لمساعدة إضافية، لا تتردد في التواصل معنا
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <p className="font-bold">📧 البريد الإلكتروني</p>
                <p className="text-sm">hanynan8@gmail.com</p>
              </div>
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <p className="font-bold">📱 واتساب</p>
                <p className="text-sm">+201201061216</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/30">
              <p className="text-sm font-semibold opacity-80">Developed & Designed by</p>
              <p className="text-3xl font-light mt-2" style={{ 
                fontFamily: "'Great Vibes', 'Allura', cursive"
              }}>
                Hany Younan
              </p>
              <p className="text-xs mt-1 opacity-60 font-medium">Full Stack Developer</p>
            </div>
          </div>
          {/* Watermark ضخم في الخلفية - علامة مائية */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-9xl font-light" style={{ 
              fontFamily: "'Great Vibes', 'Allura', cursive",
              transform: 'rotate(-15deg)',
              opacity: 0.06,
              color: 'white'
            }}>
              Hany Younan
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-2" style={{ borderColor: '#DAA520' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-right">
              <h3 className="font-bold mb-1" style={{ color: '#8B4513' }}>لوحة تحكم لمطبخ أم خاطر</h3>
              <p className="text-sm" style={{ color: '#666' }}>إدارة محتوى الموقع بكل سهولة</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold opacity-70 mb-1" style={{ color: '#8B4513' }}>Developed by</p>
              <p className="text-2xl font-light" style={{ 
                color: '#CD853F',
                fontFamily: "'Great Vibes', 'Allura', cursive"
              }}>
                Hany Younan
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm" style={{ color: '#8B4513' }}>نسخة 1.0</p>
              <p className="text-xs" style={{ color: '#999' }}>جميع الحقوق محفوظة © 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}