import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomerDetails = ({ customer, onClose, onEdit }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {t('customer.customerDetails')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Header */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
            <div className="flex-shrink-0 h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-3xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  customer.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? t('customer.active') : t('customer.inactive')}
                </span>
                {customer.gstin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    GST Registered
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">{t('customer.totalOrders')}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{customer.totalOrders}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">{t('customer.totalSpent')}</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(customer.totalSpent)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">{t('customer.availableCredit')}</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(customer.availableCredit)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">{t('customer.loyaltyPoints')}</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{customer.loyaltyPoints}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {t('customer.contactInfo')}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">{t('customer.phone')}</p>
                  <p className="text-base font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">{t('customer.email')}</p>
                    <p className="text-base font-medium text-gray-900">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.gstin && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">{t('customer.gstin')}</p>
                    <p className="text-base font-medium text-gray-900">{customer.gstin}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {(customer.address || customer.city || customer.state || customer.pincode) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                {t('customer.addressInfo')}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    {customer.address && (
                      <p className="text-base text-gray-900">{customer.address}</p>
                    )}
                    <p className="text-base text-gray-900 mt-1">
                      {[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {t('customer.creditInfo')}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('customer.creditLimit')}</span>
                <span className="text-base font-semibold text-gray-900">{formatCurrency(customer.creditLimit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('customer.creditUsed')}</span>
                <span className="text-base font-semibold text-gray-900">{formatCurrency(customer.creditBalance)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">{t('customer.availableCredit')}</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(customer.availableCredit)}</span>
              </div>
              {/* Credit Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${customer.creditLimit > 0 ? (customer.creditBalance / customer.creditLimit) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                {t('customer.notes')}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-base text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">{t('customer.createdAt')}:</span>{' '}
                {formatDate(customer.createdAt)}
              </div>
              {customer.updatedAt && (
                <div>
                  <span className="font-medium">{t('customer.updatedAt')}:</span>{' '}
                  {formatDate(customer.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            {t('common.close')}
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
          >
            {t('common.edit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;

// Made with Bob
