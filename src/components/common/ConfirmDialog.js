// src/components/common/ConfirmDialog.js

import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning', // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '⚠️',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
        };
      default: // warning
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className={`${colors.bg} border-b-4 ${colors.border} p-8`}>
          <div className="flex items-center gap-4">
            <div className={`${colors.iconBg} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
              {colors.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          </div>
        </div>

        <div className="p-8">
          <p className="text-lg text-gray-700 leading-relaxed">{message}</p>
        </div>

        <div className="p-8 pt-0 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl text-lg font-bold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${colors.confirmBtn} text-white py-4 rounded-xl text-lg font-bold transition transform hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

// Made with Bob
