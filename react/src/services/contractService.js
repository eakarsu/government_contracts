import api from './api';

class ContractService {
  // Search contracts using vector database
  async searchContracts(searchParams) {
    const response = await api.post('/contracts/search', searchParams);
    return response.data;
  }

  // Get contract details
  async getContractDetails(contractId) {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  }

  // Process contract documents
  async processContractDocuments(contractId) {
    const response = await api.post(`/contracts/${contractId}/process-documents`);
    return response.data;
  }

  // Get AI analysis of contract
  async getContractAnalysis(contractId) {
    const response = await api.get(`/contracts/${contractId}/analysis`);
    return response.data;
  }

  // Save search criteria
  async saveSearch(searchParams) {
    const response = await api.post('/contracts/searches/save', searchParams);
    return response.data;
  }

  // Get saved searches
  async getSavedSearches() {
    const response = await api.get('/contracts/searches');
    return response.data;
  }

  // Index contracts from SAM.gov
  async indexContracts(dateRange) {
    const response = await api.post('/contracts/index', dateRange);
    return response.data;
  }

  // Delete saved search - ADD THIS METHOD
  async deleteSearch(searchId) {
    const response = await api.delete(`/contracts/searches/${searchId}`);
    return response.data;
  }

  // Toggle search alert - ADD THIS METHOD
  async toggleSearchAlert(searchId) {
    const response = await api.put(`/contracts/searches/${searchId}/toggle-alert`);
    return response.data;
  }

  // Get dashboard stats - ADD THIS METHOD
  async getDashboardStats() {
    const response = await api.get('/contracts/dashboard-stats');
    return response.data;
  }

  // List contracts - ADD THIS METHOD
  async listContracts(params = {}) {
    const response = await api.get('/contracts', { params });
    return response.data;
  }
  
}

export default new ContractService();