'use client';

import { useState, useEffect } from 'react';
import { Database, Settings, Menu, Navigation, Info, BookOpen, ChevronDown, ChevronUp, Image, Upload, Link2, CheckCircle, AlertCircle, Phone, Users, Edit, Save, X } from 'lucide-react';

// Import real components
import NavbarAdmin from './components/navbar';
import FooterAdmin from './components/footer';
import MenuAdmin from './components/menu';

// WhatsApp Management Component
function WhatsAppAdmin() {
  const [whatsappData, setWhatsappData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWhatsAppData();
  }, []);

  const fetchWhatsAppData = async () => {
    try {
      const response = await fetch('/api/data?collection=whatsapp');
      const data = await response.json();
      if (data && data.length > 0) {
        setWhatsappData(data[0]);
        setNewPhone(data[0].whatsApp);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      setLoading(false);
    }
  };
const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    console.log('🔍 Attempting to save WhatsApp number...');
    console.log('📱 New phone:', newPhone);
    console.log('🆔 Document ID:', whatsappData?._id);
    
    try {
      // التحقق من صحة رقم الواتساب
      if (!newPhone || newPhone.trim() === '') {
        setMessage('❌ Please enter WhatsApp number');
        setSaving(false);
        return;
      }

      if (!whatsappData?._id) {
        setMessage('❌ No document ID found');
        setSaving(false);
        return;
      }

      // نبعت الـ ID في الـ query string والبيانات في الـ body
      const updatedData = {
        ...whatsappData,
        whatsApp: newPhone.trim()
      };
      
      console.log('📤 Sending payload:', updatedData);

      const response = await fetch(`/api/data?collection=whatsapp&id=${whatsappData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });
      
      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (response.ok) {
        setMessage('✅ WhatsApp number saved successfully!');
        setWhatsappData(updatedData);
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error('❌ Server error:', result);
        setMessage(`❌ Error: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setMessage(`❌ Connection error: ${error.message}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: '#DAA520' }}>
        <p className="text-center" style={{ color: '#8B4513' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: '#DAA520' }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderColor: '#CD853F' }}>
        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#8B4513' }}>
          <Phone size={28} style={{ color: '#DAA520' }} />
          WhatsApp Number Management
        </h2>
      </div>

      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="text-center font-bold">{message}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2" style={{ borderColor: '#DAA520' }}>
          <label className="block text-lg font-bold mb-3" style={{ color: '#8B4513' }}>
            Current WhatsApp Number:
          </label>
          
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone size={24} style={{ color: '#CD853F' }} />
                <span className="text-2xl font-bold" style={{ color: '#8B4513' }}>
                  {whatsappData?.whatsApp || 'No number available'}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(to right, #DAA520, #CD853F)' }}
              >
                <Edit size={20} />
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+20xxxxxxxxxx"
                className="w-full px-4 py-3 border-2 rounded-lg text-xl"
                style={{ borderColor: '#DAA520', direction: 'ltr' }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold hover:scale-105 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #8B4513, #A0522D)' }}
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewPhone(whatsappData?.whatsApp || '');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white font-bold hover:scale-105 transition-all"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
          <p className="text-sm flex items-start gap-2" style={{ color: '#8B4513' }}>
            <Info size={18} className="mt-1" />
            <span>
              <strong>Note:</strong> Make sure to write the WhatsApp number in correct international format (example: +2001201061216)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Customers Display Component
function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/data?collection=auth');
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: '#DAA520' }}>
        <p className="text-center" style={{ color: '#8B4513' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: '#DAA520' }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderColor: '#CD853F' }}>
        <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#8B4513' }}>
          <Users size={28} style={{ color: '#DAA520' }} />
          Customer Data ({customers.length})
        </h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg text-lg"
          style={{ borderColor: '#DAA520' }}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 opacity-30" style={{ color: '#DAA520' }} />
          <p className="text-xl" style={{ color: '#8B4513' }}>
            {searchTerm ? 'No search results found' : 'No registered customers'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer._id}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 hover:shadow-lg transition-all"
              style={{ borderColor: '#DAA520' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: 'linear-gradient(to right, #DAA520, #CD853F)' }}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#8B4513' }}>
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#CD853F' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#8B4513' }}>Phone Number:</p>
                  <p className="text-lg" style={{ direction: 'ltr', textAlign: 'left' }}>{customer.phone}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#CD853F' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#8B4513' }}>Payment Method:</p>
                  <p className="text-lg">
                    {customer.paymentMethod === 'cash' ? '💵 Cash' : '💳 Credit Card'}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#CD853F' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#8B4513' }}>Customer Location:</p>
                  <p className="text-lg">{customer.location || 'Not specified'}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#CD853F' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#8B4513' }}>Detailed Address:</p>
                  <p className="text-lg">{customer.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      setError('Incorrect password');
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
              Um Khater Kitchen Control Panel
            </h1>
            <p className="text-gray-600">Please enter password to login</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-left mb-2 font-semibold" style={{ color: '#8B4513' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl text-left focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: error ? '#ef4444' : '#DAA520',
                  focusRing: '#CD853F'
                }}
                placeholder="Enter password"
                dir="ltr"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-left">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #DAA520, #CD853F)'
              }}
            >
              Login
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
    { id: 'footer', name: 'Footer', icon: Info, component: FooterAdmin },
    { id: 'whatsapp', name: 'WhatsApp', icon: Phone, component: WhatsAppAdmin },
    { id: 'customers', name: 'Customers', icon: Users, component: CustomersAdmin }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MenuAdmin;

  const userGuides = [
    {
      id: 'whatsapp',
      title: '📱 WhatsApp Number Management Guide',
      icon: Phone,
      color: 'blue',
      steps: [
        {
          title: '1️⃣ How to Edit WhatsApp Number',
          content: [
            '✅ Go to "WhatsApp" tab from sidebar',
            '✅ Click on "Edit" button',
            '✅ Enter new WhatsApp number in international format (+20xxxxxxxxxx)',
            '✅ Click "Save" to confirm changes',
            '⚠️ Make sure to write the number in correct format'
          ]
        }
      ]
    },
    {
      id: 'customers',
      title: '👥 Customer Data Display Guide',
      icon: Users,
      color: 'green',
      steps: [
        {
          title: '1️⃣ How to View Customers',
          content: [
            '✅ Go to "Customers" tab from sidebar',
            '✅ A list of all registered customers will appear',
            '✅ You can search for a customer using name, phone, or address',
            '✅ Each customer card contains: name, phone, address, payment method, registration date'
          ]
        }
      ]
    },
    {
      id: 'navbar',
      title: '📌 Navbar Editing Guide',
      icon: Navigation,
      color: 'blue',
      steps: [
        {
          title: '1️⃣ Edit Logo',
          content: [
            '✅ Click "Edit" button in Navbar card',
            '✅ Find "logo" → "image_url" field',
            '✅ Paste new image link (see image upload steps below)',
            '✅ You can edit kitchen name in "name" field',
            '⚠️ Make sure to upload image first on GitHub (see yellow section below)'
          ]
        },
        {
          title: '2️⃣ Edit Menu Items',
          content: [
            '✅ Open "menu_items" section',
            '✅ Each item has: title, link',
            '✅ To edit section name: change "title" field',
            '✅ To change link: edit "link" field',
            '❌ Never delete "id" field!'
          ]
        },
        {
          title: '3️⃣ Arabic and English Versions',
          content: [
            '🇸🇦 "ar" section for Arabic version',
            '🇬🇧 "en" section for English version',
            '⚠️ Make sure to edit both versions together',
            '✅ Save changes by clicking "Save Changes"'
          ]
        }
      ]
    },
    {
      id: 'menu',
      title: '🍽️ Menu Editing Guide',
      icon: Menu,
      color: 'green',
      steps: [
        {
          title: '1️⃣ Add New Dish',
          content: [
            '✅ Choose required category from top buttons (e.g: Stuffed, Desserts)',
            '✅ Click "Add New Dish" button',
            '✅ Fill Arabic data: Name, Price, Description',
            '✅ Fill English data: Name, Price, Description',
            '✅ Add main image link (image)',
            '✅ Add hover image link (hoverImage) - optional',
            '✅ Click "Add Dish"'
          ]
        },
        {
          title: '2️⃣ Edit Existing Dish',
          content: [
            '✅ Find dish in list',
            '✅ Click "Edit" button',
            '✅ Edit required data',
            '✅ Don\'t forget to edit Arabic and English versions',
            '✅ Click "Save Changes"'
          ]
        },
        {
          title: '3️⃣ Delete Dish',
          content: [
            '⚠️ Warning! Deletion is permanent',
            '✅ Click "Delete" button next to dish',
            '✅ Confirm deletion from popup window',
            '❌ Cannot undo deletion'
          ]
        },
        {
          title: '4️⃣ Edit Kitchen Information',
          content: [
            '✅ Click on "Kitchen Information" tab',
            '✅ Edit: Name, Logo, Description, Phone, Location',
            '✅ Edit Arabic and English versions',
            '✅ Click "Save Kitchen Information"'
          ]
        },
        {
          title: '5️⃣ Edit Hero Slider',
          content: [
            '✅ Click on "Hero Slider" tab',
            '✅ Each slide has: image, title, description, price, offer',
            '✅ Edit Arabic and English data for each slide',
            '✅ Click "Save Hero Slider"'
          ]
        }
      ]
    },
    {
      id: 'footer',
      title: '🔽 Footer Editing Guide',
      icon: Info,
      color: 'purple',
      steps: [
        {
          title: '1️⃣ Edit "About Kitchen" Section',
          content: [
            '✅ Click "Edit" button',
            '✅ Find "about" section',
            '✅ Edit title and description',
            '✅ Edit Arabic (ar) and English (en) versions',
            '✅ Click "Save Changes"'
          ]
        },
        {
          title: '2️⃣ Edit Quick Links',
          content: [
            '✅ Open "quickLinks" section',
            '✅ Each link has: name and url',
            '✅ To edit link name: change "name" field',
            '✅ To change address: edit "url" field',
            '⚠️ Make sure links are correct before saving'
          ]
        },
        {
          title: '3️⃣ Edit Contact Information',
          content: [
            '✅ Open "contact" section',
            '✅ Edit: phone, email, location',
            '✅ Edit working hours',
            '✅ Make sure numbers are written correctly'
          ]
        },
        {
          title: '4️⃣ Edit Social Media Links',
          content: [
            '✅ Open "social" → "platforms" section',
            '✅ Each platform has: name, icon, link',
            '✅ Edit "url" field to change link',
            '⚠️ Make sure account links are correct'
          ]
        },
        {
          title: '5️⃣ Edit Copyright',
          content: [
            '✅ Find "copyright" field',
            '✅ Edit text as you want',
            '✅ Edit Arabic and English versions',
            '✅ Save changes'
          ]
        }
      ]
    }
  ];

  const imageUploadGuide = {
    title: '📸 Steps to Upload Images Correctly',
    steps: [
      {
        step: '1',
        title: 'Compress Image Size',
        icon: Image,
        color: 'bg-yellow-500',
        details: [
          '🌐 Open TinyPNG website: https://tinypng.com',
          '📤 Upload image to website',
          '⏳ Wait until compression finishes',
          '💾 Download compressed image to your device',
          '✅ Image is now ready to upload!'
        ]
      },
      {
        step: '2',
        title: 'Upload Image to GitHub',
        icon: Upload,
        color: 'bg-blue-500',
        details: [
          '🌐 Open GitHub Repository for images',
          '📁 Choose appropriate folder (e.g: menu-images)',
          '➕ Click "Add file" → "Upload files"',
          '📤 Drag image or select it from your device',
          '💬 Write Commit message (e.g: "Add new dish image")',
          '✅ Click "Commit changes"'
        ]
      },
      {
        step: '3',
        title: 'Get Image Link',
        icon: Link2,
        color: 'bg-green-500',
        details: [
          '👆 Click on image in GitHub',
          '🖱️ Right-click on image',
          '📋 Choose "Copy image address"',
          '✅ Link is now in clipboard!',
          '📝 Paste link in "image_url" field in control panel'
        ]
      }
    ]
  };

  const importantNotes = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Important Tips ✅',
      items: [
        'Save backup before editing',
        'Edit Arabic and English versions together',
        'Make sure links are correct before saving',
        'Use high quality images with small size',
        'Test edits in testing environment first'
      ]
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Important Warnings ⚠️',
      items: [
        'Never delete "id" or "_id" fields!',
        'Don\'t change field names (like: name, title, link)',
        'Make sure to upload images before adding their links',
        'Deletion is permanent and cannot be undone',
        'Click "Save" after each edit'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir="ltr">
      {/* Import signature font */}
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
              Um Khater Kitchen Control Panel
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
                Website Sections
              </h2>
              <div className="space-y-3">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all text-left font-medium shadow-md hover:shadow-lg ${
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

              {/* Additional Information */}
              <div className="mt-8 p-4 rounded-xl border-2" style={{
                background: 'linear-gradient(to right, #FFF9E6, #FFF5CC)',
                borderColor: '#DAA520'
              }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#8B4513' }}>
                  <Info size={18} />
                  Information
                </h3>
                <p className="text-sm" style={{ color: '#666' }}>
                  Use this panel to manage website content easily
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
      {/* Complete User Guide */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* Guide Title */}
        <div className="rounded-2xl shadow-2xl p-8 mb-8 border-4 relative overflow-hidden" style={{
          background: 'linear-gradient(to right, #DAA520, #CD853F)',
          borderColor: '#8B4513'
        }}>
          <div className="flex items-center justify-between gap-4 text-white relative z-10">
            <div className="flex items-center gap-4">
              <BookOpen size={48} className="animate-bounce" />
              <div>
                <h2 className="text-3xl font-bold mb-2">📚 Complete User Guide</h2>
                <p className="text-lg opacity-90">Learn how to edit every part of the website easily</p>
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
          {/* Watermark in background */}
          <div className="absolute bottom-4 right-4 text-white text-5xl font-light pointer-events-none" style={{
            fontFamily: "'Great Vibes', 'Allura', cursive",
            opacity: 0.08
          }}>
            Hany Younan
          </div>
        </div>

        {/* Image Upload Steps - Featured Section */}
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
              <strong>Very Important:</strong> You must upload images first on GitHub and get the link before adding it in the control panel!
            </p>
          </div>
        </div>

        {/* Component Guides */}
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

        {/* Tips and Warnings */}
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

        {/* Support Information */}
        <div className="rounded-2xl shadow-2xl p-8 mt-8 border-4 relative overflow-hidden" style={{
          background: 'linear-gradient(to right, #8B4513, #A0522D)',
          borderColor: '#654321'
        }}>
          <div className="text-white text-center relative z-10">
            <h3 className="text-2xl font-bold mb-3">💡 Need Help?</h3>
            <p className="text-lg mb-4 opacity-90">
              If you encounter any problem or need additional help, don't hesitate to contact us
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <p className="font-bold">📧 Email</p>
                <p className="text-sm">hanynan8@gmail.com</p>
              </div>
              <div className="rounded-lg px-6 py-3" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <p className="font-bold">📱 WhatsApp</p>
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
          {/* Huge watermark in background */}
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
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-1" style={{ color: '#8B4513' }}>Um Khater Kitchen Control Panel</h3>
              <p className="text-sm" style={{ color: '#666' }}>Manage website content with ease</p>
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
            <div className="text-center md:text-right">
              <p className="text-sm" style={{ color: '#8B4513' }}>Version 2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}