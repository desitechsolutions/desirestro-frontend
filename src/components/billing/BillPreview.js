import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

const BillPreview = ({ bill, onClose, onPayment }) => {
  const { t } = useTranslation();
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Bill-${bill.billNumber}`,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaxTypeLabel = (taxType) => {
    switch (taxType) {
      case 'CGST_SGST':
        return 'CGST + SGST';
      case 'IGST':
        return 'IGST';
      case 'NO_TAX':
        return 'No Tax';
      default:
        return taxType;
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: t('billing.paymentMethod.cash'),
      UPI: t('billing.paymentMethod.upi'),
      CARD: t('billing.paymentMethod.card'),
      WALLET: t('billing.paymentMethod.wallet'),
      CREDIT_ACCOUNT: t('billing.paymentMethod.credit'),
      ONLINE: t('billing.paymentMethod.online')
    };
    return labels[method] || method;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-gray-800">
            {t('billing.billPreview')}
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

        {/* Bill Content - Printable */}
        <div ref={printRef} className="p-8">
          {/* Restaurant Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {localStorage.getItem('restaurantName') || 'Restaurant Name'}
            </h1>
            <p className="text-sm text-gray-600">
              {localStorage.getItem('restaurantAddress') || 'Restaurant Address'}
            </p>
            <p className="text-sm text-gray-600">
              Phone: {localStorage.getItem('restaurantPhone') || 'N/A'} | 
              GSTIN: {localStorage.getItem('restaurantGSTIN') || 'N/A'}
            </p>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-600">{t('billing.billNumber')}:</p>
              <p className="font-bold text-lg">{bill.billNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">{t('billing.billDate')}:</p>
              <p className="font-semibold">{formatDate(bill.billDate)}</p>
            </div>
            <div>
              <p className="text-gray-600">{t('billing.kotNumber')}:</p>
              <p className="font-semibold">{bill.kotNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">{t('billing.table')}:</p>
              <p className="font-semibold">{bill.tableNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Customer Details */}
          {bill.customerId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t('billing.customerDetails')}</h3>
              <p className="text-sm text-gray-600">Customer ID: {bill.customerId}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">{t('billing.item')}</th>
                  <th className="text-center py-2 text-sm font-semibold text-gray-700">{t('billing.qty')}</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">{t('billing.price')}</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">{t('billing.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {bill.items && bill.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 text-sm">{index + 1}</td>
                    <td className="py-2">
                      <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                      {item.spiceLevel && (
                        <p className="text-xs text-gray-500">Spice: {item.spiceLevel}</p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500">{item.specialInstructions}</p>
                      )}
                    </td>
                    <td className="py-2 text-center text-sm">{item.quantity}</td>
                    <td className="py-2 text-right text-sm">{formatCurrency(item.price)}</td>
                    <td className="py-2 text-right text-sm font-medium">{formatCurrency(item.itemTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Summary */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('billing.subtotal')}:</span>
                  <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>

                {/* Service Charge */}
                {bill.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('billing.serviceCharge')}:</span>
                    <span className="font-medium">{formatCurrency(bill.serviceCharge)}</span>
                  </div>
                )}

                {/* Packaging Charges */}
                {bill.packagingCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('billing.packagingCharges')}:</span>
                    <span className="font-medium">{formatCurrency(bill.packagingCharges)}</span>
                  </div>
                )}

                {/* Delivery Charges */}
                {bill.deliveryCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('billing.deliveryCharges')}:</span>
                    <span className="font-medium">{formatCurrency(bill.deliveryCharges)}</span>
                  </div>
                )}

                {/* Discount */}
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      {t('billing.discount')}
                      {bill.discountRate > 0 && ` (${bill.discountRate}%)`}:
                    </span>
                    <span className="font-medium">-{formatCurrency(bill.discountAmount)}</span>
                  </div>
                )}

                {/* Tax Details */}
                {bill.taxType !== 'NO_TAX' && (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-xs text-gray-500 mb-1">{getTaxTypeLabel(bill.taxType)}</p>
                    </div>
                    
                    {bill.cgstAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST ({bill.cgstRate}%):</span>
                        <span className="font-medium">{formatCurrency(bill.cgstAmount)}</span>
                      </div>
                    )}

                    {bill.sgstAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST ({bill.sgstRate}%):</span>
                        <span className="font-medium">{formatCurrency(bill.sgstAmount)}</span>
                      </div>
                    )}

                    {bill.igstAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IGST ({bill.igstRate}%):</span>
                        <span className="font-medium">{formatCurrency(bill.igstAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">{t('billing.totalTax')}:</span>
                      <span>{formatCurrency(bill.totalTax)}</span>
                    </div>
                  </>
                )}

                {/* Round Off */}
                {bill.roundOff !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('billing.roundOff')}:</span>
                    <span className="font-medium">{formatCurrency(bill.roundOff)}</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex justify-between pt-3 border-t-2 border-gray-300 mt-2">
                  <span className="text-lg font-bold text-gray-900">{t('billing.grandTotal')}:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(bill.grandTotal)}</span>
                </div>

                {/* Payment Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('billing.paymentMethod.title')}:</span>
                    <span className="font-semibold">{getPaymentMethodLabel(bill.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{t('billing.paymentStatus')}:</span>
                    <span className={`font-semibold ${
                      bill.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {bill.paymentStatus}
                    </span>
                  </div>
                  {bill.paidAt && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">{t('billing.paidAt')}:</span>
                      <span className="text-gray-700">{formatDate(bill.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">{t('billing.thankYou')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('billing.visitAgain')}</p>
          </div>

          {/* Print Timestamp */}
          <div className="mt-4 text-center text-xs text-gray-400 print:block hidden">
            Printed on: {new Date().toLocaleString('en-IN')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('billing.print')}
          </button>
          
          {bill.paymentStatus !== 'PAID' && (
            <button
              onClick={() => onPayment(bill.id)}
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('billing.markAsPaid')}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default BillPreview;

// Made with Bob
