import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import CustomerList from '../../components/customer/CustomerList';
import CustomerForm from '../../components/customer/CustomerForm';
import CustomerDetails from '../../components/customer/CustomerDetails';

const CustomerManagement = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const restaurantId = localStorage.getItem('restaurantId');

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, filterActive]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm) {
        response = await api.get(`/restaurants/${restaurantId}/customers/search`, {
          params: { query: searchTerm, page: pagination.page, size: pagination.size }
        });
      } else if (filterActive === 'active') {
        response = await api.get(`/restaurants/${restaurantId}/customers/active`, {
          params: { page: pagination.page, size: pagination.size }
        });
      } else {
        response = await api.get(`/restaurants/${restaurantId}/customers`, {
          params: { page: pagination.page, size: pagination.size }
        });
      }

      setCustomers(response.data.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
    } catch (error) {
      showToast(t('customer.fetchError'), 'error');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 0 }));
    if (term) {
      searchCustomers(term);
    } else {
      fetchCustomers();
    }
  };

  const searchCustomers = async (term) => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${restaurantId}/customers/search`, {
        params: { query: term, page: 0, size: pagination.size }
      });
      setCustomers(response.data.content);
      setPagination(prev => ({
        ...prev,
        page: 0,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
    } catch (error) {
      showToast(t('customer.searchError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm(t('customer.deleteConfirm'))) return;

    try {
      await api.delete(`/restaurants/${restaurantId}/customers/${customerId}`);
      showToast(t('customer.deleteSuccess'), 'success');
      fetchCustomers();
    } catch (error) {
      showToast(t('customer.deleteError'), 'error');
      console.error('Error deleting customer:', error);
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (selectedCustomer) {
        await api.put(`/restaurants/${restaurantId}/customers/${selectedCustomer.id}`, customerData);
        showToast(t('customer.updateSuccess'), 'success');
      } else {
        await api.post(`/restaurants/${restaurantId}/customers`, customerData);
        showToast(t('customer.createSuccess'), 'success');
      }
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      showToast(
        error.response?.data?.message || t('customer.saveError'),
        'error'
      );
      throw error;
    }
  };

  const handleCreditOperation = async (customerId, operation, amount) => {
    try {
      await api.post(
        `/restaurants/${restaurantId}/customers/${customerId}/credit/${operation}`,
        null,
        { params: { amount } }
      );
      showToast(t(`customer.credit.${operation}Success`), 'success');
      fetchCustomers();
    } catch (error) {
      showToast(t(`customer.credit.${operation}Error`), 'error');
    }
  };

  const handleLoyaltyOperation = async (customerId, operation, points) => {
    try {
      await api.post(
        `/restaurants/${restaurantId}/customers/${customerId}/loyalty/${operation}`,
        null,
        { params: { points } }
      );
      showToast(t(`customer.loyalty.${operation}Success`), 'success');
      fetchCustomers();
    } catch (error) {
      showToast(t(`customer.loyalty.${operation}Error`), 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t('customer.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('customer.subtitle', { count: pagination.totalElements })}
          </p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('customer.addNew')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('customer.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg ${
                filterActive === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('customer.filter.all')}
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg ${
                filterActive === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('customer.filter.active')}
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <CustomerList
        customers={customers}
        loading={loading}
        onEdit={handleEditCustomer}
        onView={handleViewCustomer}
        onDelete={handleDeleteCustomer}
        onCreditOperation={handleCreditOperation}
        onLoyaltyOperation={handleLoyaltyOperation}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          onSave={handleSaveCustomer}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Customer Details Modal */}
      {showDetails && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
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

export default CustomerManagement;

// Made with Bob
