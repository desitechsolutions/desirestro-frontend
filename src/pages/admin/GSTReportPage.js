// src/pages/admin/GSTReportPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getGSTReport } from '../../services/api';
import GSTReportCard from '../../components/reports/GSTReportCard';
import ExportButtons from '../../components/reports/ExportButtons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/Navbar';

const GSTReportPage = () => {
  const { currentUser } = useAuth();
  const restaurantId = currentUser?.restaurantId;
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [gstReport, setGstReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Month and Year state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const fetchGSTReport = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getGSTReport(restaurantId, selectedMonth, selectedYear);
      setGstReport(response.data);
    } catch (err) {
      console.error('Error fetching GST report:', err);
      setError(err.response?.data?.message || 'Failed to load GST report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGSTReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleGenerateReport = () => {
    fetchGSTReport();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
        >
          ← {t('nav.backToDashboard')}
        </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('admin.gstReports')} (GSTR-1)</h1>
        <p className="text-gray-600">Generate GST compliance report for tax filing</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
          <ExportButtons
            restaurantId={restaurantId}
            reportType="gst"
            params={{ month: selectedMonth, year: selectedYear }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchGSTReport}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* GST Report Card */}
      {gstReport && <GSTReportCard gstReport={gstReport} />}

      {/* B2B Invoices Detail */}
      {gstReport?.b2bInvoices && gstReport.b2bInvoices.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">B2B Invoices (With GSTIN)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">Customer GSTIN</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">Taxable Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">CGST</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">SGST</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">IGST</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gstReport.b2bInvoices.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">{invoice.customerGSTIN}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{formatCurrency(invoice.taxableValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600">{formatCurrency(invoice.cgst)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{formatCurrency(invoice.sgst)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-purple-600">{formatCurrency(invoice.igst)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">{formatCurrency(invoice.invoiceValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right">Total:</td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(gstReport.b2bInvoices.reduce((sum, inv) => sum + (inv.taxableValue || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-blue-600">
                    {formatCurrency(gstReport.b2bInvoices.reduce((sum, inv) => sum + (inv.cgst || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600">
                    {formatCurrency(gstReport.b2bInvoices.reduce((sum, inv) => sum + (inv.sgst || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-purple-600">
                    {formatCurrency(gstReport.b2bInvoices.reduce((sum, inv) => sum + (inv.igst || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(gstReport.b2bInvoices.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* B2C Invoices Summary */}
      {gstReport?.b2cInvoices && gstReport.b2cInvoices.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">B2C Invoices (Without GSTIN)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Invoices</p>
              <p className="text-3xl font-bold text-blue-600">{gstReport.b2cInvoices.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Value</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(gstReport.b2cInvoices.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0))}
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Tax</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(gstReport.b2cInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0))}
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Avg Invoice</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(
                  gstReport.b2cInvoices.length > 0
                    ? gstReport.b2cInvoices.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0) / gstReport.b2cInvoices.length
                    : 0
                )}
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase">Taxable Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase">Tax Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gstReport.b2cInvoices.slice(0, 20).map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{formatCurrency(invoice.taxableValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{formatCurrency(invoice.taxAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">{formatCurrency(invoice.invoiceValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gstReport.b2cInvoices.length > 20 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Showing 20 of {gstReport.b2cInvoices.length} invoices. Export to Excel for complete list.
              </p>
            )}
          </div>
        </div>
      )}

      {/* HSN Summary Detail */}
      {gstReport?.hsnSummary && gstReport.hsnSummary.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">HSN-wise Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase">HSN Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase">UQC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase">Taxable Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase">Tax Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase">Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gstReport.hsnSummary.map((hsn, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900">{hsn.hsnCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{hsn.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{hsn.uqc || 'NOS'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{hsn.quantity || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">{formatCurrency(hsn.taxableValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{hsn.taxRate || 18}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-purple-600">{formatCurrency(hsn.taxAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right">Total:</td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(gstReport.hsnSummary.reduce((sum, hsn) => sum + (hsn.taxableValue || 0), 0))}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-purple-600">
                    {formatCurrency(gstReport.hsnSummary.reduce((sum, hsn) => sum + (hsn.taxAmount || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Filing Instructions */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg mt-8">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">📋 Filing Instructions</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Export this report to Excel for easy data entry into GST portal</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Verify all B2B customer GSTIN numbers before filing</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Ensure HSN codes are correctly mapped to all items</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>File GSTR-1 by the 11th of the following month</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">5.</span>
            <span>Keep backup of this report for audit purposes</span>
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default GSTReportPage;

// Made with Bob
