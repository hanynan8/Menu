'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, RefreshCw, Menu, ChevronDown, ChevronUp, Upload, Loader, AlertCircle, CheckCircle, Layers, Image } from 'lucide-react';

const API_BASE_URL = '/api/data';

export default function MenuAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('items'); // items, restaurant, hero, slider, categories
  const [formData, setFormData] = useState({
    ar: { name: '', price: '', currency: 'درهم', description: '', hoverDescription: '' },
    en: { name: '', price: '', currency: 'AED', description: '', hoverDescription: '' },
    image: '',
    hoverImage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?collection=Menu`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في جلب البيانات: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      // الـ API بترجع array فيها object واحد
      setData(Array.isArray(result) ? result[0] : result);
      showMessage('تم تحديث بيانات Menu بنجاح');
    } catch (error) {
      showMessage('خطأ في جلب بيانات Menu: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const updateFullData = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?collection=Menu&id=${updatedData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        showMessage('✓ تم تحديث البيانات بنجاح');
        setEditingItem(null);
        fetchData();
      } else {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث البيانات: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      showMessage('خطأ في تحديث البيانات: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const updateRestaurantInfo = (section, lang, field, value) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData[section][lang][field] = value;
    setData(updatedData);
  };

  const saveRestaurantInfo = () => {
    updateFullData(data);
  };

  const updateHeroSlide = (slideIndex, lang, field, value) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.heroSlider.slides[slideIndex][lang][field] = value;
    setData(updatedData);
  };

  const updateSlideImage = (slideIndex, value) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    updatedData.heroSlider.slides[slideIndex].image = value;
    setData(updatedData);
  };

  const saveHeroSlider = () => {
    updateFullData(data);
  };

  const addItemToCategory = (categoryId, newItem) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const category = updatedData.categories.find(cat => cat.id === categoryId);
    
    if (category && category.items) {
      // Generate new ID
      const maxId = category.items.reduce((max, item) => {
        const itemNum = parseInt(item.id.split('_')[1] || '0');
        return Math.max(max, itemNum);
      }, 0);
      
      newItem.id = `item_${maxId + 1}`;
      category.items.push(newItem);
      updateFullData(updatedData);
    }
  };

  const updateItemInCategory = (categoryId, itemId, updatedItem) => {
    const updatedData = JSON.parse(JSON.stringify(data));
    const category = updatedData.categories.find(cat => cat.id === categoryId);
    
    if (category && category.items) {
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        category.items[itemIndex] = { ...category.items[itemIndex], ...updatedItem };
        updateFullData(updatedData);
      }
    }
  };

  const deleteItemFromCategory = (categoryId, itemId) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا الطبق؟')) return;
    
    const updatedData = JSON.parse(JSON.stringify(data));
    const category = updatedData.categories.find(cat => cat.id === categoryId);
    
    if (category && category.items) {
      category.items = category.items.filter(item => item.id !== itemId);
      updateFullData(updatedData);
    }
  };

  const renderFieldLabel = (field) => {
    const labels = {
      name: 'الاسم',
      price: 'السعر',
      currency: 'العملة',
      description: 'الوصف',
      hoverDescription: 'الوصف عند التمرير',
      image: 'الصورة الرئيسية',
      hoverImage: 'صورة التمرير'
    };
    return labels[field] || field;
  };

  const renderImageField = (field, currentValue, onChange) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {renderFieldLabel(field)}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            value={currentValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="رابط الصورة (https://...)"
          />
          <button 
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
            onClick={() => {
              const url = prompt('الصق رابط الصورة هنا:');
              if (url) onChange(url);
            }}
          >
            <Upload size={20} />
          </button>
        </div>
        {currentValue && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-2">معاينة:</div>
            <img 
              src={currentValue} 
              alt={field} 
              className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 shadow-md"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="%23f3f4f6" width="160" height="160"/><text x="80" y="85" text-anchor="middle" fill="%236b7280">صورة غير صالحة</text></svg>';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderItemForm = (categoryId, isEditing = false) => {
    const handleSubmit = () => {
      if (isEditing) {
        updateItemInCategory(categoryId, editingItem.id, formData);
      } else {
        addItemToCategory(categoryId, formData);
        setShowAddForm(false);
      }
    };

    return (
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200">
        <div className="space-y-6">
          {/* Arabic Fields */}
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="text-lg font-bold text-blue-900 mb-4">🇸🇦 البيانات بالعربي</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  value={formData.ar.name}
                  onChange={(e) => setFormData({...formData, ar: {...formData.ar, name: e.target.value}})}
                  placeholder="اسم الطبق بالعربي"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السعر</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 pl-16"
                    value={formData.ar.price}
                    onChange={(e) => setFormData({...formData, ar: {...formData.ar, price: e.target.value}})}
                    placeholder="45"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">درهم</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  rows="3"
                  value={formData.ar.description}
                  onChange={(e) => setFormData({...formData, ar: {...formData.ar, description: e.target.value}})}
                  placeholder="وصف الطبق بالعربي"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف عند التمرير</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  rows="2"
                  value={formData.ar.hoverDescription}
                  onChange={(e) => setFormData({...formData, ar: {...formData.ar, hoverDescription: e.target.value}})}
                  placeholder="وصف إضافي يظهر عند التمرير"
                />
              </div>
            </div>
          </div>

          {/* English Fields */}
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="text-lg font-bold text-green-900 mb-4">🇬🇧 English Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  value={formData.en.name}
                  onChange={(e) => setFormData({...formData, en: {...formData.en, name: e.target.value}})}
                  placeholder="Dish name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 pl-16"
                    value={formData.en.price}
                    onChange={(e) => setFormData({...formData, en: {...formData.en, price: e.target.value}})}
                    placeholder="45"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">AED</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  rows="3"
                  value={formData.en.description}
                  onChange={(e) => setFormData({...formData, en: {...formData.en, description: e.target.value}})}
                  placeholder="Dish description in English"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hover Description</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  rows="2"
                  value={formData.en.hoverDescription}
                  onChange={(e) => setFormData({...formData, en: {...formData.en, hoverDescription: e.target.value}})}
                  placeholder="Additional description on hover"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderImageField('image', formData.image, (val) => setFormData({...formData, image: val}))}
            {renderImageField('hoverImage', formData.hoverImage, (val) => setFormData({...formData, hoverImage: val}))}
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t-2 border-gray-200">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {isEditing ? 'حفظ التعديلات' : 'إضافة الطبق'}
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(false);
              setFormData({
                ar: { name: '', price: '', currency: 'درهم', description: '', hoverDescription: '' },
                en: { name: '', price: '', currency: 'AED', description: '', hoverDescription: '' },
                image: '',
                hoverImage: ''
              });
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
          >
            <X size={18} />
            إلغاء
          </button>
        </div>
      </div>
    );
  };

  if (!data || !data.categories) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-6" dir="rtl">
        <div className="text-center py-16">
          <Loader className="animate-spin mx-auto mb-6 text-blue-600" size={48} />
          <p className="text-gray-600 text-xl">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const allItems = data.categories.flatMap(cat => 
    (cat.items || []).map(item => ({ ...item, categoryId: cat.id, categoryNameAr: cat.ar.name }))
  );

  const filteredItems = searchTerm 
    ? allItems.filter(item => 
        item.ar?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.en?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryNameAr?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allItems;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100" dir="rtl">
      <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
            <Menu size={28} />
            قائمة الطعام
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="🔍 البحث في الأطباق..."
          className="w-full px-5 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Messages */}
      {success && (
        <div className="mx-6 mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={24} />
          <span className="font-medium">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="mx-6 mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="p-6">
        {/* Main Navigation Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap border-b-2 border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 rounded-t-lg font-bold text-lg ${
              activeTab === 'items' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🍽️ الأطباق والمنتجات
          </button>
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-6 py-3 rounded-t-lg font-bold text-lg ${
              activeTab === 'restaurant' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🏪 معلومات المطعم
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-3 rounded-t-lg font-bold text-lg ${
              activeTab === 'hero' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎯 Hero Section
          </button>
          <button
            onClick={() => setActiveTab('slider')}
            className={`px-6 py-3 rounded-t-lg font-bold text-lg ${
              activeTab === 'slider' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎠 Hero Slider
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-t-lg font-bold text-lg ${
              activeTab === 'categories' 
                ? 'bg-pink-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📁 إعدادات الفئات
          </button>
        </div>

        {/* Restaurant Info Tab */}
        {activeTab === 'restaurant' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">📋 معلومات المطعم</h3>
            
            {/* Arabic Section */}
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
              <h4 className="text-xl font-bold text-blue-900 mb-4">🇸🇦 البيانات بالعربي</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">اسم المطعم</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.ar?.name || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'ar', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">الشعار</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.ar?.tagline || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'ar', 'tagline', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">الوصف</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    rows="3"
                    value={data?.restaurant?.ar?.description || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'ar', 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">رقم الهاتف</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.ar?.phone || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'ar', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">الموقع</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.ar?.location || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'ar', 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* English Section */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h4 className="text-xl font-bold text-green-900 mb-4">🇬🇧 English Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.en?.name || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'en', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tagline</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.en?.tagline || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'en', 'tagline', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    rows="3"
                    value={data?.restaurant?.en?.description || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'en', 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.en?.phone || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'en', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.restaurant?.en?.location || ''}
                    onChange={(e) => updateRestaurantInfo('restaurant', 'en', 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveRestaurantInfo}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ معلومات المطعم
            </button>
          </div>
        )}

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-green-900 mb-4">🎯 Hero Section</h3>
            
            {/* Arabic Hero */}
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
              <h4 className="text-xl font-bold text-blue-900 mb-4">🇸🇦 البيانات بالعربي</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">العنوان الرئيسي</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.ar?.title || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'ar', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">العنوان الفرعي</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.ar?.subtitle || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'ar', 'subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">نص الزر</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.ar?.cta || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'ar', 'cta', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">المميزات (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.ar?.features?.join(', ') || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'ar', 'features', e.target.value.split(',').map(f => f.trim()))}
                  />
                </div>
              </div>
            </div>

            {/* English Hero */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h4 className="text-xl font-bold text-green-900 mb-4">🇬🇧 English Data</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Main Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.en?.title || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'en', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Subtitle</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.en?.subtitle || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'en', 'subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Button Text</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.en?.cta || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'en', 'cta', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Features (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                    value={data?.hero?.en?.features?.join(', ') || ''}
                    onChange={(e) => updateRestaurantInfo('hero', 'en', 'features', e.target.value.split(',').map(f => f.trim()))}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveRestaurantInfo}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ Hero Section
            </button>
          </div>
        )}

        {/* Hero Slider Tab */}
        {activeTab === 'slider' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-orange-900 mb-4">🎠 Hero Slider</h3>
            
            {data?.heroSlider?.slides?.map((slide, index) => (
              <div key={slide.id} className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
                <h4 className="text-xl font-bold text-orange-900 mb-4">
                  Slide #{index + 1} - {slide.id}
                </h4>
                
                {/* Slide Image */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">صورة السلايد</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                      value={slide.image || ''}
                      onChange={(e) => updateSlideImage(index, e.target.value)}
                    />
                    <button 
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      onClick={() => {
                        const url = prompt('الصق رابط الصورة:');
                        if (url) updateSlideImage(index, url);
                      }}
                    >
                      <Upload size={20} />
                    </button>
                  </div>
                  {slide.image && (
                    <img src={slide.image} alt="" className="mt-3 w-48 h-32 object-cover rounded-lg" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h5 className="font-bold text-blue-900 mb-3">🇸🇦 عربي</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="الشارة (Badge)"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.ar?.badge || ''}
                        onChange={(e) => updateHeroSlide(index, 'ar', 'badge', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="العنوان"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.ar?.title || ''}
                        onChange={(e) => updateHeroSlide(index, 'ar', 'title', e.target.value)}
                      />
                      <textarea
                        placeholder="الوصف"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        rows="2"
                        value={slide.ar?.description || ''}
                        onChange={(e) => updateHeroSlide(index, 'ar', 'description', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="العرض (Offer)"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.ar?.offer || ''}
                        onChange={(e) => updateHeroSlide(index, 'ar', 'offer', e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="السعر"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.ar?.price || ''}
                          onChange={(e) => updateHeroSlide(index, 'ar', 'price', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="السعر القديم"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.ar?.oldPrice || ''}
                          onChange={(e) => updateHeroSlide(index, 'ar', 'oldPrice', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="العملة"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.ar?.currency || ''}
                          onChange={(e) => updateHeroSlide(index, 'ar', 'currency', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* English */}
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <h5 className="font-bold text-green-900 mb-3">🇬🇧 English</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Badge"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.en?.badge || ''}
                        onChange={(e) => updateHeroSlide(index, 'en', 'badge', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.en?.title || ''}
                        onChange={(e) => updateHeroSlide(index, 'en', 'title', e.target.value)}
                      />
                      <textarea
                        placeholder="Description"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        rows="2"
                        value={slide.en?.description || ''}
                        onChange={(e) => updateHeroSlide(index, 'en', 'description', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Offer"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                        value={slide.en?.offer || ''}
                        onChange={(e) => updateHeroSlide(index, 'en', 'offer', e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Price"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.en?.price || ''}
                          onChange={(e) => updateHeroSlide(index, 'en', 'price', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Old Price"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.en?.oldPrice || ''}
                          onChange={(e) => updateHeroSlide(index, 'en', 'oldPrice', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Currency"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={slide.en?.currency || ''}
                          onChange={(e) => updateHeroSlide(index, 'en', 'currency', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={saveHeroSlider}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ Hero Slider
            </button>
          </div>
        )}

        {/* Categories Settings Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-pink-900 mb-4">📁 إعدادات الفئات</h3>
            
            {data?.categories?.map((category, index) => (
              <div key={category.id} className="border-2 border-pink-200 rounded-lg p-6 bg-pink-50">
                <h4 className="text-xl font-bold text-pink-900 mb-4">
                  {category.ar.name} - {category.id}
                </h4>
                
                {/* Category Image */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">صورة الفئة</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg"
                      value={category.image || ''}
                      onChange={(e) => {
                        const updatedData = JSON.parse(JSON.stringify(data));
                        updatedData.categories[index].image = e.target.value;
                        setData(updatedData);
                      }}
                    />
                  </div>
                  {category.image && (
                    <img src={category.image} alt="" className="mt-3 w-48 h-32 object-cover rounded-lg" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Arabic */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h5 className="font-bold text-blue-900 mb-3">🇸🇦 عربي</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">الاسم</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={category.ar?.name || ''}
                          onChange={(e) => {
                            const updatedData = JSON.parse(JSON.stringify(data));
                            updatedData.categories[index].ar.name = e.target.value;
                            setData(updatedData);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">الوصف</label>
                        <textarea
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          rows="2"
                          value={category.ar?.description || ''}
                          onChange={(e) => {
                            const updatedData = JSON.parse(JSON.stringify(data));
                            updatedData.categories[index].ar.description = e.target.value;
                            setData(updatedData);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* English */}
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <h5 className="font-bold text-green-900 mb-3">🇬🇧 English</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          value={category.en?.name || ''}
                          onChange={(e) => {
                            const updatedData = JSON.parse(JSON.stringify(data));
                            updatedData.categories[index].en.name = e.target.value;
                            setData(updatedData);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Description</label>
                        <textarea
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          rows="2"
                          value={category.en?.description || ''}
                          onChange={(e) => {
                            const updatedData = JSON.parse(JSON.stringify(data));
                            updatedData.categories[index].en.description = e.target.value;
                            setData(updatedData);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  عدد الأطباق: {category.items?.length || 0}
                </div>
              </div>
            ))}

            <button
              onClick={() => updateFullData(data)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ إعدادات الفئات
            </button>
          </div>
        )}

        {/* Items Tab (Original Code) */}
        {activeTab === 'items' && (
          <>
        {/* Categories Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            الكل ({allItems.length})
          </button>
          {data.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.ar.name} ({cat.items?.length || 0})
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && selectedCategory && (
          <div className="mb-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-900">
              <Plus size={28} />
              إضافة طبق جديد
            </h3>
            {renderItemForm(selectedCategory, false)}
          </div>
        )}

        {/* Add Button */}
        {selectedCategory && !showAddForm && (
          <button
            onClick={() => {
              setFormData({
                ar: { name: '', price: '', currency: 'درهم', description: '', hoverDescription: '' },
                en: { name: '', price: '', currency: 'AED', description: '', hoverDescription: '' },
                image: '',
                hoverImage: ''
              });
              setShowAddForm(true);
            }}
            className="mb-6 flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg"
          >
            <Plus size={18} />
            إضافة طبق جديد لـ {data.categories.find(c => c.id === selectedCategory)?.ar.name}
          </button>
        )}

        {/* Items Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            قائمة الأطباق
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mr-2">
              {filteredItems.length}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems
            .filter(item => !selectedCategory || item.categoryId === selectedCategory)
            .map((item) => {
              const isEditing = editingItem?.id === item.id && editingItem?.categoryId === item.categoryId;
              
              if (isEditing) {
                return (
                  <div key={item.id} className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-l-8 border-blue-500">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-900">
                      <Edit size={24} />
                      تعديل: {item.ar?.name}
                    </h3>
                    {renderItemForm(item.categoryId, true)}
                  </div>
                );
              }
              
              return (
                <div key={`${item.categoryId}-${item.id}`} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 overflow-hidden">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.ar?.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%23f3f4f6" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="%236b7280">صورة</text></svg>';
                      }}
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800 flex-1">{item.ar?.name}</h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {item.categoryNameAr}
                      </span>
                    </div>
                    {item.ar?.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.ar.description}</p>
                    )}
                    {item.ar?.price && (
                      <p className="text-2xl font-bold text-green-600 mb-4">
                        {item.ar.price} {item.ar.currency}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            ar: {
                              name: item?.ar?.name || '',
                              price: item?.ar?.price || '',
                              currency: item?.ar?.currency || 'درهم',
                              description: item?.ar?.description || '',
                              hoverDescription: item?.ar?.hoverDescription || ''
                            },
                            en: {
                              name: item?.en?.name || '',
                              price: item?.en?.price || '',
                              currency: item?.en?.currency || 'AED',
                              description: item?.en?.description || '',
                              hoverDescription: item?.en?.hoverDescription || ''
                            },
                            image: item?.image || '',
                            hoverImage: item?.hoverImage || ''
                          });
                          setEditingItem({ ...item, categoryId: item.categoryId });
                          setShowAddForm(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                      >
                        <Edit size={16} />
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteItemFromCategory(item.categoryId, item.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
          </>
        )}
      </div>
    </div>
  );
}