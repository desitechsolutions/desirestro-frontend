import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import BillPreview from '../../components/billing/BillPreview';

const BillingPage = () => {
  const { t } = useTranslation();
  const [kots, setKots] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedKot, setSelectedKot] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [billData, setBillData] = useState({
    taxType: 'CGST_SGST',
    serviceChargeRate: 10,
    packagingCharges: 0,
    deliveryCharges: 0,
    discountRate: 0,
    discountAmount: 0,
    paymentMethod: 'CASH'
  });

  const restaurantId = localStorage.getItem('restaurantId');

  const TAX_TYPES = [
    { value: 'CGST_SGST', label: t('billing.taxType.cgstSgst'), description: 'CGST 9% + SGST 9%' },
    { value: 'IGST', label: t('billing.taxType.igst'), description: 'IGST 18%' },
    { value: 'NO_TAX', label: t('billing.taxType.noTax'), description: t('billing.taxType.noTaxDesc') }
  ];

  const PAYMENT_METHODS = [
    { value: 'CASH', label: t('billing.paymentMethod.cash'), icon: '💵' },
    { value: 'UPI', label: t('billing.paymentMethod.upi'), icon: '📱' },
    { value: 'CARD', label: t('billing.paymentMethod.card'), icon: '💳' },
    { value: 'WALLET', label: t('billing.paymentMethod.wallet'), icon: '👛' },
    { value: 'CREDIT_ACCOUNT', label: t('billing.paymentMethod.credit'), icon: '📋' },
    { value: 'ONLINE', label: t('billing.paymentMethod.online'), icon: '🌐' }
  ];

  useEffect(() => {
    fetchReadyKots();
    fetchCustomers();
  }, []);

  const fetchReadyKots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${restaurantId}/kots`, {
        params: { status: 'READY' }
      });
      setKots(response.data);
    } catch (error) {
      showToast(t('billing.fetchKotsError'), 'error');
      console.error('Error fetching KOTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/customers/active`);
      setCustomers(response.data.content || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleKotSelect = (kot) => {
    setSelectedKot(kot);
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
  };

  const handleBillDataChange = (field, value) => {
    setBillData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear opposite discount field
    if (field === 'discountRate' && value > 0) {
      setBillData(prev => ({ ...prev, discountAmount: 0 }));
    } else if (field === 'discountAmount' && value > 0) {
      setBillData(prev => ({ ...prev, discountRate: 0 }));
    }
  };

  const calculateBillPreview = () => {
    if (!selectedKot) return null;

    // Calculate subtotal
    const subtotal = selectedKot.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    // Service charge
    const serviceCharge = (subtotal * billData.serviceChargeRate) / 100;

    // Total before tax
    const totalBeforeTax = subtotal + serviceCharge + 
      billData.packagingCharges + billData.deliveryCharges;

    // Discount
    let discount = 0;
    if (billData.discountRate > 0) {
      discount = (totalBeforeTax * billData.discountRate) / 100;
    } else if (billData.discountAmount > 0) {
      discount = billData.discountAmount;
    }

    // Taxable amount
    const taxableAmount = totalBeforeTax - discount;

    // Tax calculation
    let cgst = 0, sgst = 0, igst = 0;
    if (billData.taxType === 'CGST_SGST') {
      cgst = (taxableAmount * 9) / 100;
      sgst = (taxableAmount * 9) / 100;
    } else if (billData.taxType === 'IGST') {
      igst = (taxableAmount * 18) / 100;
    }

    const totalTax = cgst + sgst + igst;
    const totalAmount = taxableAmount + totalTax;
    const roundOff = Math.round(totalAmount) - totalAmount;
    const grandTotal = Math.round(totalAmount);

    return {
      subtotal,
      serviceCharge,
      packagingCharges: billData.packagingCharges,
      deliveryCharges: billData.deliveryCharges,
      discount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      roundOff,
      grandTotal
    };
  };

  const handleGenerateBill = async () => {
    if (!selectedKot) {
      showToast(t('billing.selectKotError'), 'error');
      return;
    }

    if (billData.paymentMethod === 'CREDIT_ACCOUNT' && !selectedCustomer) {
      showToast(t('billing.selectCustomerError'), 'error');
      return;
    }

    try {
      setGenerating(true);
      const requestData = {
        kotId: selectedKot.id,
        customerId: selectedCustomer?.id || null,
        taxType: billData.taxType,
        serviceChargeRate: billData.serviceChargeRate,
        packagingCharges: billData.packagingCharges,
        deliveryCharges: billData.deliveryCharges,
        discountRate: billData.discountRate > 0 ? billData.discountRate : null,
        discountAmount: billData.discountAmount > 0 ? billData.discountAmount : null,
        paymentMethod: billData.paymentMethod
      };

      const response = await api.post(
        `/restaurants/${restaurantId}/bills`,
        requestData
      );

      setGeneratedBill(response.data);
      setShowPreview(true);
      showToast(t('billing.generateSuccess'), 'success');
    } catch (error) {
      showToast(
        error.response?.data?.message || t('billing.generateError'),
        'error'
      );
      console.error('Error generating bill:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePayment = async (billId) => {
    try {
      await api.post(
        `/restaurants/${restaurantId}/bills/${billId}/payment`,
        null,
        { params: { paymentMethod: billData.paymentMethod } }
      );
      showToast(t('billing.paymentSuccess'), 'success');
      setShowPreview(false);
      setSelectedKot(null);
      setSelectedCustomer(null);
      fetchReadyKots();
    } catch (error) {
      showToast(t('billing.paymentError'), 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const preview = calculateBillPreview();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {t('billing.title')}
        </h1>
        <p className="text-gray-600 mt-1">{t('billing.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - KOT Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* KOT Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.selectKot')}
            </h2>
            {kots.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">{t('billing.noReadyKots')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kots.map((kot) => (
                  <div
                    key={kot.id}
                    onClick={() => handleKotSelect(kot)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedKot?.id === kot.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{kot.kotNumber}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {kot.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t('billing.table')}: {kot.party?.tableNumber || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('billing.items')}: {kot.items?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KOT Items */}
          {selectedKot && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t('billing.kotItems')}
              </h2>
              <div className="space-y-2">
                {selectedKot.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.menuItemName}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500">{item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                      <p className="font-semibold text-gray-900">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.customer')} {billData.paymentMethod === 'CREDIT_ACCOUNT' && <span className="text-red-500">*</span>}
            </h2>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('billing.selectCustomer')}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">{t('billing.totalOrders')}:</span>
                    <span className="ml-2 font-semibold">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('billing.loyaltyPoints')}:</span>
                    <span className="ml-2 font-semibold text-yellow-600">{selectedCustomer.loyaltyPoints}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Bill Configuration */}
        <div className="space-y-6">
          {/* Tax Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.taxType.title')}
            </h2>
            <div className="space-y-2">
              {TAX_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    billData.taxType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="taxType"
                    value={type.value}
                    checked={billData.taxType === type.value}
                    onChange={(e) => handleBillDataChange('taxType', e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Charges */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.charges')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('billing.serviceCharge')} (%)
                </label>
                <input
                  type="number"
                  value={billData.serviceChargeRate}
                  onChange={(e) => handleBillDataChange('serviceChargeRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('billing.packagingCharges')} (₹)
                </label>
                <input
                  type="number"
                  value={billData.packagingCharges}
                  onChange={(e) => handleBillDataChange('packagingCharges', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('billing.deliveryCharges')} (₹)
                </label>
                <input
                  type="number"
                  value={billData.deliveryCharges}
                  onChange={(e) => handleBillDataChange('deliveryCharges', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.discount')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('billing.discountRate')} (%)
                </label>
                <input
                  type="number"
                  value={billData.discountRate}
                  onChange={(e) => handleBillDataChange('discountRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-center text-sm text-gray-500">OR</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('billing.discountAmount')} (₹)
                </label>
                <input
                  type="number"
                  value={billData.discountAmount}
                  onChange={(e) => handleBillDataChange('discountAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('billing.paymentMethod.title')}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => handleBillDataChange('paymentMethod', method.value)}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    billData.paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-xs font-medium">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bill Preview Summary */}
          {preview && selectedKot && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t('billing.summary')}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('billing.subtotal')}:</span>
                  <span className="font-medium">₹{preview.subtotal.toFixed(2)}</span>
                </div>
                {preview.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('billing.serviceCharge')}:</span>
                    <span className="font-medium">₹{preview.serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                {preview.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('billing.discount')}:</span>
                    <span className="font-medium">-₹{preview.discount.toFixed(2)}</span>
                  </div>
                )}
                {billData.taxType !== 'NO_TAX' && (
                  <>
                    {preview.cgst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span className="font-medium">₹{preview.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {preview.sgst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span className="font-medium">₹{preview.sgst.toFixed(2)}</span>
                      </div>
                    )}
                    {preview.igst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">IGST (18%):</span>
                        <span className="font-medium">₹{preview.igst.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {preview.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('billing.roundOff')}:</span>
                    <span className="font-medium">₹{preview.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-900">{t('billing.grandTotal')}:</span>
                  <span className="text-xl font-bold text-blue-600">₹{preview.grandTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generate Bill Button */}
          <button
            onClick={handleGenerateBill}
            disabled={!selectedKot || generating}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? t('billing.generating') : t('billing.generateBill')}
          </button>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showPreview && generatedBill && (
        <BillPreview
          bill={generatedBill}
          onClose={() => setShowPreview(false)}
          onPayment={handlePayment}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default BillingPage;

// Made with Bob
