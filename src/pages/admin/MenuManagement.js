// src/pages/admin/MenuManagement.js

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: 0,
    veg: true,
    categoryId: null,
    ingredients: []
  });

  // Category Management State
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', displayOrder: 0 });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  // UI Feedback States (replaces alerts)
  const [message, setMessage] = useState({ text: '', type: '' });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMenuData = async () => {
    try {
      const [catRes, itemRes, ingRes] = await Promise.all([
        API.get('/api/menu/categories'),
        API.get('/api/menu/items'),
        API.get('/api/ingredients')
      ]);

      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setMenuItems(Array.isArray(itemRes.data) ? itemRes.data : []);
      setIngredients(Array.isArray(ingRes.data) ? ingRes.data : []);
    } catch (err) {
      console.error('Menu error:', err);
      setCategories([]);
      setMenuItems([]);
      setIngredients([]);
      showMessage('Failed to load menu data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to show inline messages
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // MENU ITEM FUNCTIONS
  const createMenuItem = async () => {
    if (!newMenuItem.name.trim()) {
      showMessage('Item name is required', 'error');
      return;
    }
    if (newMenuItem.price <= 0) {
      showMessage('Price must be greater than 0', 'error');
      return;
    }
    if (!newMenuItem.categoryId) {
      showMessage('Please select a category', 'error');
      return;
    }

    try {
      const res = await API.post('/api/menu/items', newMenuItem);
      setMenuItems(prev => [...prev, res.data]);
      setNewMenuItem({
        name: '',
        description: '',
        price: 0,
        veg: true,
        categoryId: null,
        ingredients: []
      });
      showMessage('Menu item added successfully!');
    } catch (err) {
      showMessage('Failed to add menu item', 'error');
    }
  };

  const updateMenuItem = async () => {
    try {
      const res = await API.put(`/api/menu/items/${editingMenuItem.id}`, editingMenuItem);
      setMenuItems(prev => prev.map(i => i.id === editingMenuItem.id ? res.data : i));
      setEditingMenuItem(null);
      showMessage('Menu item updated successfully!');
    } catch (err) {
      showMessage('Failed to update menu item', 'error');
    }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await API.delete(`/api/menu/items/${id}`);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      showMessage('Menu item deleted');
    } catch (err) {
      showMessage('Failed to delete menu item', 'error');
    }
  };

  // CATEGORY FUNCTIONS
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      showMessage('Category name is required', 'error');
      return;
    }
    try {
      const res = await API.post('/api/menu/categories', {
        name: newCategory.name.trim(),
        displayOrder: newCategory.displayOrder || null
      });
      setCategories(prev => [...prev, res.data]);
      setNewCategory({ name: '', displayOrder: 0 });
      setShowNewCategoryForm(false);
      showMessage('Category added successfully!');
    } catch (err) {
      showMessage('Failed to add category', 'error');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory.name.trim()) {
      showMessage('Category name is required', 'error');
      return;
    }
    try {
      const res = await API.put(`/api/menu/categories/${editingCategory.id}`, editingCategory);
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? res.data : c));
      setEditingCategory(null);
      showMessage('Category updated successfully!');
    } catch (err) {
      showMessage('Failed to update category', 'error');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Items will lose their category.')) return;
    try {
      await API.delete(`/api/menu/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      showMessage('Category deleted');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Cannot delete category — it has menu items', 'error');
    }
  };

  // Ingredient helpers
  const addIngredientToNew = () => {
    setNewMenuItem(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: null, quantityRequired: 0 }]
    }));
  };

  const updateIngredientInNew = (index, field, value) => {
    const ingCopy = [...newMenuItem.ingredients];
    ingCopy[index][field] = field === 'quantityRequired' ? parseFloat(value) || 0 : parseInt(value) || null;
    setNewMenuItem(prev => ({ ...prev, ingredients: ingCopy }));
  };

  const removeIngredientFromNew = (index) => {
    setNewMenuItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addIngredientToEdit = () => {
    setEditingMenuItem(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { ingredientId: null, quantityRequired: 0 }]
    }));
  };

  const updateIngredientInEdit = (index, field, value) => {
    const ingCopy = [...(editingMenuItem.ingredients || [])];
    ingCopy[index][field] = field === 'quantityRequired' ? parseFloat(value) || 0 : parseInt(value) || null;
    setEditingMenuItem(prev => ({ ...prev, ingredients: ingCopy }));
  };

  const removeIngredientFromEdit = (index) => {
    setEditingMenuItem(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="text-center py-40 text-4xl text-gray-600">Loading menu...</div>;
  }

  return (
    <>
      <h2 className="text-5xl font-bold text-center text-amber-800 mb-16">
        Menu Management
      </h2>

      {/* Global Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-8 py-4 rounded-2xl shadow-2xl text-white text-2xl font-bold ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'} animate-pulse`}>
          {message.text}
        </div>
      )}

      {/* CATEGORY MANAGEMENT SECTION */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl mb-20">
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-4xl font-bold text-gray-800">Manage Categories</h3>
          <button
            onClick={() => setShowNewCategoryForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-10 py-6 rounded-2xl text-2xl font-bold shadow-xl transition transform hover:scale-105"
          >
            + Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-600">No categories yet. Click "+ Add Category" to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map(cat => (
              <div key={cat.id} className="bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-3xl border-4 border-amber-300 shadow-xl flex flex-col">
                <div className="flex-1">
                  <h4 className="text-4xl font-bold text-amber-800">{cat.name}</h4>
                  <p className="text-xl text-gray-600 mt-4">
                    Display Order: {cat.displayOrder || 'Auto'}
                  </p>
                </div>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-bold transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-xl font-bold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD MENU ITEM FORM */}
      <div className="bg-white p-12 rounded-3xl shadow-3xl mb-16">
        <h3 className="text-4xl font-bold text-gray-800 mb-10">Add New Menu Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <input
            type="text"
            placeholder="Item Name"
            value={newMenuItem.name}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
            className="px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={newMenuItem.price || ''}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) || 0 })}
            className="px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          />
          <select
            value={newMenuItem.categoryId || ''}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, categoryId: e.target.value ? parseInt(e.target.value) : null })}
            className="px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl focus:outline-none focus:border-amber-600"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-6">
            <label className="text-3xl font-semibold">Veg:</label>
            <input
              type="checkbox"
              checked={newMenuItem.veg}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, veg: e.target.checked })}
              className="w-12 h-12"
            />
          </div>
        </div>

        <textarea
          placeholder="Description (optional)"
          value={newMenuItem.description}
          onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
          className="w-full px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl mb-10 focus:outline-none focus:border-amber-600"
          rows="3"
        />

        {/* Ingredients Section */}
        <div className="mb-10">
          <h4 className="text-3xl font-bold mb-6">Ingredients (for inventory tracking)</h4>
          {newMenuItem.ingredients.length === 0 ? (
            <p className="text-xl text-gray-500 mb-6">No ingredients added yet</p>
          ) : (
            <div className="space-y-4 mb-6">
              {newMenuItem.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <select
                    value={ing.ingredientId || ''}
                    onChange={(e) => updateIngredientInNew(idx, 'ingredientId', e.target.value)}
                    className="px-6 py-4 text-xl border-2 border-gray-300 rounded-xl flex-1"
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={ing.quantityRequired || ''}
                    onChange={(e) => updateIngredientInNew(idx, 'quantityRequired', e.target.value)}
                    className="px-6 py-4 text-xl border-2 border-gray-300 rounded-xl w-32"
                  />
                  <button
                    onClick={() => removeIngredientFromNew(idx)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={addIngredientToNew}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-bold"
          >
            + Add Ingredient
          </button>
        </div>

        <button
          onClick={createMenuItem}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-8 rounded-2xl text-4xl font-bold shadow-2xl transition transform hover:scale-105"
        >
          + ADD MENU ITEM
        </button>
      </div>

      {/* MENU ITEMS LIST */}
      <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center">
        Current Menu ({menuItems.length} items)
      </h3>

      {menuItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-3xl text-gray-600">No menu items yet. Add your first dish!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white p-10 rounded-3xl shadow-3xl border-4 border-amber-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-4xl font-bold text-amber-800">{item.name}</h4>
                  <p className="text-xl text-gray-600 mt-4">{item.categoryName|| 'No Category'}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-amber-700">₹{item.price}</div>
                  <div className="text-xl mt-2">{item.veg ? '🟢 Veg' : '🔴 Non-Veg'}</div>
                </div>
              </div>
              {item.description && <p className="text-lg text-gray-700 mb-8 italic">{item.description}</p>}
              <div className="flex gap-4">
                <button
                  onClick={() => setEditingMenuItem(item)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-2xl font-bold transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl text-2xl font-bold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MENU ITEM MODAL */}
      {editingMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-4xl w-full overflow-y-auto max-h-[90vh]">
            <h3 className="text-4xl font-bold text-amber-800 mb-10 text-center">
              Edit Menu Item — {editingMenuItem.name}
            </h3>
            <div className="space-y-8">
              <input
                type="text"
                value={editingMenuItem.name}
                onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
              />
              <input
                type="number"
                value={editingMenuItem.price}
                onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
              />
              <select
                value={editingMenuItem.categoryId || editingMenuItem.category?.id || ''}
                onChange={(e) => setEditingMenuItem({ ...editingMenuItem, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-6">
                <label className="text-3xl">Veg:</label>
                <input
                  type="checkbox"
                  checked={editingMenuItem.veg}
                  onChange={(e) => setEditingMenuItem({ ...editingMenuItem, veg: e.target.checked })}
                  className="w-12 h-12"
                />
              </div>
              <textarea
                value={editingMenuItem.description || ''}
                onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                className="w-full px-8 py-6 text-2xl border-4 border-amber-400 rounded-2xl"
                rows="4"
              />

              {/* Ingredients in Edit Modal */}
              <div>
                <h4 className="text-3xl font-bold mb-6">Ingredients</h4>
                {(editingMenuItem.ingredients || []).length === 0 ? (
                  <p className="text-xl text-gray-500 mb-6">No ingredients assigned</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {(editingMenuItem.ingredients || []).map((ing, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <select
                          value={ing.ingredientId || ing.ingredient?.id || ''}
                          onChange={(e) => updateIngredientInEdit(idx, 'ingredientId', e.target.value)}
                          className="px-6 py-4 text-xl border-2 border-gray-300 rounded-xl flex-1"
                        >
                          <option value="">Select Ingredient</option>
                          {ingredients.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={ing.quantityRequired || ''}
                          onChange={(e) => updateIngredientInEdit(idx, 'quantityRequired', e.target.value)}
                          className="px-6 py-4 text-xl border-2 border-gray-300 rounded-xl w-32"
                        />
                        <button
                          onClick={() => removeIngredientFromEdit(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={addIngredientToEdit}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-bold"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>
            <div className="flex gap-6 mt-12">
              <button
                onClick={updateMenuItem}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingMenuItem(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-2xl w-full">
            <h3 className="text-4xl font-bold text-amber-800 mb-10 text-center">
              Edit Category — {editingCategory.name}
            </h3>
            <div className="space-y-8">
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
                placeholder="Category Name"
              />
              <input
                type="number"
                value={editingCategory.displayOrder || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) || null })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
                placeholder="Display Order (optional)"
              />
            </div>
            <div className="flex gap-6 mt-12">
              <button
                onClick={updateCategory}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW CATEGORY MODAL */}
      {showNewCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-4xl p-12 max-w-2xl w-full">
            <h3 className="text-4xl font-bold text-amber-800 mb-10 text-center">
              Add New Category
            </h3>
            <div className="space-y-8">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
                placeholder="Category Name"
              />
              <input
                type="number"
                value={newCategory.displayOrder || ''}
                onChange={(e) => setNewCategory({ ...newCategory, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-8 py-6 text-3xl border-4 border-amber-400 rounded-2xl"
                placeholder="Display Order (optional)"
              />
            </div>
            <div className="flex gap-6 mt-12">
              <button
                onClick={createCategory}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Create Category
              </button>
              <button
                onClick={() => {
                  setShowNewCategoryForm(false);
                  setNewCategory({ name: '', displayOrder: 0 });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-6 rounded-2xl text-3xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuManagement;