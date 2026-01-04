'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, RefreshCw, Info, ChevronDown, ChevronUp, Loader, AlertCircle, CheckCircle, Layers } from 'lucide-react';
const API_BASE_URL = '/api/data';
export default function FooterAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedObjects, setExpandedObjects] = useState({});

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
      const response = await fetch(`${API_BASE_URL}?collection=footer`);
      const result = await response.json();
      setData(result);
      showMessage('Footer data updated successfully');
    } catch (error) {
      showMessage('Error fetching footer data', 'error');
    }
    setLoading(false);
  };

  const createItem = async (itemData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?collection=footer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    
      if (response.ok) {
        showMessage('✓ Item added successfully');
        setShowAddForm(false);
        setNewItem({});
        fetchData();
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      showMessage('Error adding item: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const updateItem = async (id, itemData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?collection=footer&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    
      if (response.ok) {
        showMessage('✓ Item updated successfully');
        setEditingItem(null);
        fetchData();
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      showMessage('Error updating item: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (!confirm('⚠️ Are you sure you want to delete this item?')) return;
  
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?collection=footer&id=${id}`, {
        method: 'DELETE'
      });
    
      if (response.ok) {
        showMessage('✓ Item deleted successfully');
        fetchData();
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      showMessage('Error deleting item: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;
  
    for (let i = 0; i < keys.length - 1; i++) {
      const nextKey = keys[i + 1];
      const init = !isNaN(parseInt(nextKey)) ? [] : {};
      if (!current[keys[i]]) {
        current[keys[i]] = init;
      }
      current = current[keys[i]];
    }
  
    current[keys[keys.length - 1]] = value;
    return newObj;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderFieldLabel = (field) => {
    const labels = {
      footer: 'Footer',
      ar: 'Arabic',
      en: 'English',
      about: 'About',
      quickLinks: 'Quick Links',
      contact: 'Contact Us',
      social: 'Social Media',
      copyright: 'Copyright',
      poweredBy: 'Powered By',
      title: 'Title',
      name: 'Name',
      description: 'Description',
      content: 'Content',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      location: 'Location',
      hours: 'Working Hours',
      link: 'Link',
      links: 'Links',
      platforms: 'Platforms',
      text: 'Text',
      url: 'URL',
      icon: 'Icon'
    };
    return labels[field] || field;
  };

  const renderField = (field, value, currentData, isEditing, path = field) => {
    const currentValue = getNestedValue(currentData, path);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const expandKey = `${isEditing ? 'edit' : 'new'}-${path}`;
      const isExpanded = expandedObjects[expandKey];
      return (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Layers size={16} />
              {renderFieldLabel(field)}
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {Object.keys(currentValue || {}).length} fields
              </span>
            </label>
            <button
              type="button"
              onClick={() => setExpandedObjects(prev => ({ ...prev, [expandKey]: !prev[expandKey] }))}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        
          {isExpanded && (
            <div className="space-y-3 mt-3">
              {Object.entries(currentValue || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-white rounded-lg border-2 border-blue-100">
                  {renderField(key, val, currentData, isEditing, `${path}.${key}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (Array.isArray(value)) {
      const expandKey = `${isEditing ? 'edit' : 'new'}-${path}`;
      const isExpanded = expandedObjects[expandKey];
      return (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Layers size={16} />
              {renderFieldLabel(field)}
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {(currentValue || []).length} items
              </span>
            </label>
            <button
              type="button"
              onClick={() => setExpandedObjects(prev => ({ ...prev, [expandKey]: !prev[expandKey] }))}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        
          {isExpanded && (
            <div className="space-y-3 mt-3">
              {(currentValue || []).map((val, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-40 text-sm font-medium">Item #{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    {renderField(`${field}[${index}]`, val, currentData, isEditing, `${path}.${index}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {renderFieldLabel(field)}
        </label>
        {field.includes('description') || field.includes('content') ? (
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            rows="4"
            value={currentValue || ''}
            onChange={(e) => {
              const updated = setNestedValue(isEditing ? editingItem : newItem, path, e.target.value);
              isEditing ? setEditingItem(updated) : setNewItem(updated);
            }}
            placeholder="Enter content here..."
          />
        ) : (
          <input
            type="text"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            value={currentValue || ''}
            onChange={(e) => {
              const updated = setNestedValue(isEditing ? editingItem : newItem, path, e.target.value);
              isEditing ? setEditingItem(updated) : setNewItem(updated);
            }}
          />
        )}
      </div>
    );
  };

  const renderValue = (value) => {
    if (value == null) return <span className="text-gray-700">null</span>;
    if (typeof value !== 'object' && !Array.isArray(value)) {
      return <span className="text-gray-700">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <div className="ml-4 mt-2 space-y-2">
          {value.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-medium">#{i + 1}:</span>
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="ml-4 mt-2 space-y-2">
        {Object.entries(value).map(([k, val]) => (
          <div key={k} className="flex gap-2">
            <span className="font-bold text-blue-600">{renderFieldLabel(k)}:</span>
            {renderValue(val)}
          </div>
        ))}
      </div>
    );
  };

  const renderForm = (item = {}, isEditing = false) => {
    const currentData = isEditing ? editingItem : newItem;
    const fields = Object.keys(item).filter(key => key !== '_id' && key !== 'id');
  
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200">
        <div className="grid grid-cols-1 gap-6">
          {fields.map(field => (
            <div key={field}>
              {renderField(field, item[field], currentData, isEditing)}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-8 pt-6 border-t-2 border-gray-200">
          <button
            onClick={() => {
              if (isEditing) {
                updateItem(item._id || item.id, editingItem);
              } else {
                createItem(newItem);
              }
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium"
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {isEditing ? 'Save Changes' : 'Add Item'}
          </button>
          <button
            onClick={() => {
              isEditing ? setEditingItem(null) : setShowAddForm(false);
              setNewItem({});
              setExpandedObjects({});
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const items = Array.isArray(data) ? data : data ? [data] : [];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100">
      <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
            <Info size={28} />
            Footer
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                setNewItem(items[0] ? JSON.parse(JSON.stringify(items[0])) : {});
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-medium"
            >
              <Plus size={18} />
              Add New
            </button>
          </div>
        </div>
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
        {loading ? (
          <div className="text-center py-16">
            <Loader className="animate-spin mx-auto mb-6 text-blue-600" size={48} />
            <p className="text-gray-600 text-xl">Loading...</p>
          </div>
        ) : (
          <>
            {showAddForm && (
              <div className="mb-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-900">
                  <Plus size={28} />
                  Add New Item
                </h3>
                {renderForm(items[0] || {}, false)}
              </div>
            )}
          
            <div className="space-y-6">
              {items.map((item, index) => {
                const itemId = item._id || item.id || index;
                const isEditing = editingItem && (editingItem._id === itemId || editingItem.id === itemId);
              
                if (isEditing) {
                  return (
                    <div key={itemId} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-l-8 border-blue-500">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-900">
                        <Edit size={24} />
                        Edit Item #{index + 1}
                      </h3>
                      {renderForm(item, true)}
                    </div>
                  );
                }
              
                return (
                  <div key={itemId} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm">
                            #{index + 1}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(item).map(([key, value]) => {
                            if (key === '_id' || key === 'id') return null;
                            return (
                              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                                <span className="font-bold text-blue-700 text-sm">{renderFieldLabel(key)}: </span>
                                {renderValue(value)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-3 ml-4 flex-col">
                        <button
                          onClick={() => {
                            setEditingItem(JSON.parse(JSON.stringify(item)));
                            setExpandedObjects({});
                          }}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit
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