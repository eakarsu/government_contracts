const axios = require('axios');

class SamGovService {
  constructor() {
    this.apiKey = process.env.SAM_API_KEY;
    this.baseUrl = process.env.SAM_API_URL;
  }

  async fetchContracts({ postedFrom, postedTo, limit = 1000 }) {
    try {
      const params = {
        api_key: this.apiKey,
        postedFrom: this.formatDate(postedFrom),
        postedTo: this.formatDate(postedTo),
        limit: limit
      };

      const response = await axios.get(`${this.baseUrl}/search`, { params });

      if (response.data && response.data.opportunitiesData) {
        return response.data.opportunitiesData;
      }

      return [];
    } catch (error) {
      console.error('SAM.gov API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch contracts from SAM.gov');
    }
  }

  async getContractDetails(noticeId) {
    try {
      const params = {
        api_key: this.apiKey,
        noticeId: noticeId
      };

      const response = await axios.get(`${this.baseUrl}/search`, { params });

      if (response.data && response.data.opportunitiesData && response.data.opportunitiesData.length > 0) {
        return response.data.opportunitiesData[0];
      }

      return null;
    } catch (error) {
      console.error('SAM.gov API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch contract details from SAM.gov');
    }
  }

  formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  async downloadAttachment(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return {
        data: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error('Error downloading attachment:', error.message);
      throw new Error('Failed to download attachment');
    }
  }
}

module.exports = new SamGovService();