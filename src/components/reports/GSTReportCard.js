// src/components/reports/GSTReportCard.js

import React from 'react';

const GSTReportCard = ({ gstReport }) => {
  if (!gstReport) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <p className="text-gray-500 text-center">No GST data available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };


  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">GST Summary</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Period</p>
          <p className="text-lg font-semibold">{gstReport.gstPeriod || 'N/A'}</p>
        </div>
      </div>

      {/* Total Tax Liability */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Tax Liability</p>
        <p className="text-3xl font-bold text-indigo-600">
          {formatCurrency(gstReport.totalTaxLiability)}
        </p>
      </div>

      {/* Tax Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">CGST (Central)</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(gstReport.totalCGST)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {gstReport.cgstRate || 9}% of taxable value
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">SGST (State)</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(gstReport.totalSGST)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {gstReport.sgstRate || 9}% of taxable value
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">IGST (Integrated)</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(gstReport.totalIGST)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {gstReport.igstRate || 18}% of taxable value
          </p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Taxable Value</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(gstReport.totalTaxableValue)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(gstReport.totalRevenue)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Bills</p>
          <p className="text-lg font-semibold text-gray-800">
            {gstReport.totalInvoices || 0}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Avg Bill Value</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(gstReport.averageInvoiceValue)}
          </p>
        </div>
      </div>

      {/* B2B vs B2C Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">B2B Invoices</h4>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              With GSTIN
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Count:</span>
              <span className="text-sm font-semibold">
                {gstReport.b2bInvoices?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Value:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(
                  gstReport.b2bInvoices?.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0) || 0
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatCurrency(
                  gstReport.b2bInvoices?.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0) || 0
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">B2C Invoices</h4>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Without GSTIN
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Count:</span>
              <span className="text-sm font-semibold">
                {gstReport.b2cInvoices?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Value:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(
                  gstReport.b2cInvoices?.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0) || 0
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(
                  gstReport.b2cInvoices?.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0) || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HSN Summary */}
      {gstReport.hsnSummary && gstReport.hsnSummary.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">HSN-wise Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">HSN Code</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Qty</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Taxable Value</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gstReport.hsnSummary.slice(0, 5).map((hsn, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{hsn.hsnCode || 'N/A'}</td>
                    <td className="px-4 py-2 text-right">{hsn.quantity || 0}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(hsn.taxableValue)}</td>
                    <td className="px-4 py-2 text-right text-blue-600 font-medium">
                      {formatCurrency(hsn.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gstReport.hsnSummary.length > 5 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Showing 5 of {gstReport.hsnSummary.length} HSN codes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> This report is in GSTR-1 format. Ensure all details are verified before filing.
        </p>
      </div>
    </div>
  );
};

export default GSTReportCard;

// Made with Bob
