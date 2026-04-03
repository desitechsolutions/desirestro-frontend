import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import { createMenuItem, updateMenuItem } from '../../services/api';

const SPICE_LEVELS = ['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT'];

const MenuItemForm = ({ restaurantId, item = null, onSaved = () => {}, onCancel = () => {} }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    category: '',
    name: '',
    price: '',
    hsn: '',
    spiceLevel: 'MEDIUM',
    isJain: false,
    isSwaminarayan: false,
    prepTime: '',
    available: true,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        category: item.category || '',
        name: item.name || '',
        price: item.price != null ? String(item.price) : '',
        hsn: item.hsn || '',
        spiceLevel: item.spiceLevel || 'MEDIUM',
        isJain: !!item.isJain,
        isSwaminarayan: !!item.isSwaminarayan,
        prepTime: item.prepTime != null ? String(item.prepTime) : '',
        available: item.available == null ? true : !!item.available,
        description: item.description || '',
      });
    }
  }, [item]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('validation.required');
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = t('validation.minValue');
    if (form.prepTime && (isNaN(Number(form.prepTime)) || Number(form.prepTime) < 0)) e.prepTime = t('validation.minValue');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (ev) => {
    const value = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        name: form.name.trim(),
        price: parseFloat(form.price),
        hsn: form.hsn.trim() || null,
        spiceLevel: form.spiceLevel,
        isJain: !!form.isJain,
        isSwaminarayan: !!form.isSwaminarayan,
        prepTime: form.prepTime ? parseInt(form.prepTime, 10) : null,
        available: !!form.available,
        description: DOMPurify.sanitize(form.description || ''),
      };

      let res;
      if (item && item.id) {
        res = await updateMenuItem(item.id, payload);
      } else {
        res = await createMenuItem(payload);
      }

      onSaved(res?.data || res);
    } catch (err) {
      // caller can show toast; keep minimal here
      console.error('MenuItemForm submit error', err);
      setErrors({ submit: err?.response?.data?.message || t('common.error') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium">{t('menu.category')}</label>
        <input value={form.category} onChange={handleChange('category')} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium">{t('menu.itemName')}</label>
        <input value={form.name} onChange={handleChange('name')} className="input" />
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">{t('menu.price')}</label>
          <input value={form.price} onChange={handleChange('price')} className="input" />
          {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">{t('menu.hsn')}</label>
          <input value={form.hsn} onChange={handleChange('hsn')} className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">{t('menu.spiceLevel')}</label>
          <select value={form.spiceLevel} onChange={handleChange('spiceLevel')} className="input">
            {SPICE_LEVELS.map((s) => (
              <option key={s} value={s}>
                {t(`menu.spiceLevel`)} - {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">{t('menu.prepTime')}</label>
          <input value={form.prepTime} onChange={handleChange('prepTime')} className="input" />
          {errors.prepTime && <p className="text-xs text-red-600">{errors.prepTime}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="inline-flex items-center">
          <input type="checkbox" checked={form.isJain} onChange={handleChange('isJain')} />
          <span className="ml-2 text-sm">Jain</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" checked={form.isSwaminarayan} onChange={handleChange('isSwaminarayan')} />
          <span className="ml-2 text-sm">Swaminarayan</span>
        </label>
        <label className="inline-flex items-center ml-4">
          <input type="checkbox" checked={form.available} onChange={handleChange('available')} />
          <span className="ml-2 text-sm">{t('menu.available')}</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea value={form.description} onChange={handleChange('description')} className="input h-24" />
      </div>

      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="btn-outline">
          {t('actions.cancel')}
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('common.loading') : t(item ? 'menu.editItem' : 'menu.addItem')}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
