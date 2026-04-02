// src/pages/admin/SalesReportPage.js
// Wrapper that adds Navbar and back button when SalesDashboard is accessed as a standalone route.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import SalesDashboard from './SalesDashboard';

const SalesReportPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
        >
          ← {t('nav.backToDashboard')}
        </button>
        <h1 className="text-4xl font-bold text-amber-800 mb-8">{t('admin.salesReports')}</h1>
        <SalesDashboard />
      </div>
    </div>
  );
};

export default SalesReportPage;
