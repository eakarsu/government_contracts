import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const response = await api.get('/company/profile');
      setCompanyData(response.data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyData = async (data) => {
    try {
      const response = await api.put('/company/profile', data);
      setCompanyData(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const value = {
    companyData,
    loading,
    updateCompanyData,
    fetchCompanyData
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};