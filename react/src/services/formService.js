import api from './api';

class FormService {
  // Generate form based on contract requirements
  async generateForm(contractId) {
    const response = await api.post(`/forms/generate/${contractId}`);
    return response.data;
  }

  // Submit form
  async submitForm(formData) {
    const response = await api.post('/forms/submit', formData);
    return response.data;
  }

  // Get form templates
  async getFormTemplates() {
    const response = await api.get('/forms/templates');
    return response.data;
  }

  // Save draft
  async saveDraft(formData) {
    const response = await api.post('/forms/draft', formData);
    return response.data;
  }

  // Get applications
  async getApplications() {
    const response = await api.get('/forms/applications');
    return response.data;
  }

  // Get application details
  async getApplicationDetails(applicationId) {
    const response = await api.get(`/forms/applications/${applicationId}`);
    return response.data;
  }
}

export default new FormService();