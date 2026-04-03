import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { splitBill } from '../../services/api';
import toast from 'react-hot-toast';

const SplitBillModal = ({ open = false, bill = null, restaurantId, onClose = () => {}, onSplit = () => {} }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('EQUAL'); // EQUAL or CUSTOM
  const [parts, setParts] = useState(2);
  const [customAmounts, setCustomAmounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setMode('EQUAL');
    setParts(2);
    setCustomAmounts([]);
    setError(null);
  }, [open, bill]);

  if (!open || !bill) return null;

  const total = Number(bill.total ?? bill.finalAmount ?? bill.amount ?? 0);

  const handleCustomChange = (idx) => (ev) => {
    const v = ev.target.value;
    setCustomAmounts((arr) => {
      const copy = [...arr];
      copy[idx] = v;
      return copy;
    });
  };

  const validateAndBuildPayload = () => {
    if (mode === 'EQUAL') {
      return {
        type: 'EQUAL',
        parts: parts,
      };
    } else {
      const nums = customAmounts.map((a) => Number(a || 0));
      if (nums.length !== parts) {
        setError(t('validation.required'));
        return null;
      }
      const sum = nums.reduce((s, n) => s + n, 0);
      if (Math.abs(sum - total) > 0.01) {
        setError(t('validation.invalidValue') || 'Split amounts must sum to total');
        return null;
      }
      return {
        type: 'CUSTOM',
        parts: nums.map((amt) => ({ amount: amt })),
      };
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = validateAndBuildPayload();
    if (!payload) return;
    setLoading(true);
    try {
      const res = await splitBill(restaurantId, bill.id, payload);
      onSplit(res?.data || res);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'));
      console.error('Split bill error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded max-w-lg w-full p-4">
        <h3 className="text-lg font-semibold">{t('billing.splitBill')}</h3>

        <div className="mt-3">
          <label className="inline-flex items-center mr-4">
            <input type="radio" checked={mode === 'EQUAL'} onChange={() => setMode('EQUAL')} />
            <span className="ml-2">Equal</span>
          </label>
          <label className="inline-flex items-center">
            <input type="radio" checked={mode === 'CUSTOM'} onChange={() => setMode('CUSTOM')} />
            <span className="ml-2">Custom</span>
          </label>
        </div>

        {mode === 'EQUAL' && (
          <div className="mt-3">
            <label className="block text-sm">{t('actions.add')}</label>
            <input type="number" min={2} value={parts} onChange={(e) => setParts(Math.max(2, parseInt(e.target.value || 2, 10)))} className="input" />
            <p className="text-sm mt-2">{`Each part ≈ ₹${(total / parts).toFixed(2)}`}</p>
          </div>
        )}

        {mode === 'CUSTOM' && (
          <div className="mt-3 space-y-2">
            <p className="text-sm">{t('billing.splitBill')}</p>
            {[...Array(parts)].map((_, idx) => (
              <div key={idx}>
                <label className="block text-sm">Part {idx + 1}</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={customAmounts[idx] ?? ''}
                  onChange={handleCustomChange(idx)}
                  className="input"
                />
              </div>
            ))}
            <p className="text-sm mt-2">Total: ₹{total.toFixed(2)}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="mt-4 flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="btn-outline">
            {t('actions.cancel')}
          </button>
          <button type="button" disabled={loading} onClick={handleSubmit} className="btn-primary">
            {loading ? t('common.loading') : t('billing.splitBill')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;
