// src/components/reports/ExportButtons.js

import React, { useState } from 'react';
import { exportReportPDF, exportReportExcel } from '../../services/api';

const ExportButtons = ({ restaurantId, reportType, params, reportData }) => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState(null);

  const handleExport = async (format) => {
    if (!restaurantId) {
      alert('Restaurant ID is required for export');
      return;
    }

    if (!reportType) {
      alert('Report type is required for export');
      return;
    }

    setLoading(true);
    setExportType(format);

    try {
      const exportFn = format === 'pdf' ? exportReportPDF : exportReportExcel;
      const response = await exportFn(restaurantId, reportType, params || {});
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const filename = `${reportType}_${timestamp}.${extension}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert(`Report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to export report. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
      setExportType(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isDisabled = loading || !restaurantId || !reportType;

  return (
    <div className="flex flex-wrap gap-3">
      {/* PDF Export Button */}
      <button
        onClick={() => handleExport('pdf')}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 shadow-md hover:shadow-lg
          ${isDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 active:scale-95'
          }
        `}
      >
        {loading && exportType === 'pdf' ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Export PDF</span>
          </>
        )}
      </button>

      {/* Excel Export Button */}
      <button
        onClick={() => handleExport('excel')}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 shadow-md hover:shadow-lg
          ${isDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 active:scale-95'
          }
        `}
      >
        {loading && exportType === 'excel' ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Excel</span>
          </>
        )}
      </button>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        disabled={loading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
          transition-all duration-200 shadow-md hover:shadow-lg
          ${loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 active:scale-95'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>Print</span>
      </button>

      {/* Info tooltip */}
      {!restaurantId && (
        <div className="flex items-center text-sm text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Restaurant ID required</span>
        </div>
      )}
    </div>
  );
};

export default ExportButtons;

// Made with Bob
