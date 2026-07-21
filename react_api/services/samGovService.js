const axios = require('axios');

class SamGovService {
  constructor() {
    this.apiKey = process.env.SAM_API_KEY;
    this.baseUrl = process.env.SAM_API_URL;
  }

  async fetchContracts({ postedFrom, postedTo, limit = 1000 }) {
    try {
      this.assertConfigured();
      limit = Math.max(1, Math.min(Number(limit) || 100, 1000));
      const params = {
        api_key: this.apiKey,
        postedFrom: this.formatDate(postedFrom),
        postedTo: this.formatDate(postedTo),
        limit: limit
      };

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: 15000,
        maxContentLength: 5 * 1024 * 1024
      });

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
      this.assertConfigured();
      if (typeof noticeId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(noticeId)) {
        throw new Error('Invalid notice identifier');
      }
      const params = {
        api_key: this.apiKey,
        noticeId: noticeId
      };

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: 15000,
        maxContentLength: 5 * 1024 * 1024
      });

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

  assertConfigured() {
    if (!this.apiKey || !this.baseUrl) {
      throw new Error('SAM.gov integration is not configured');
    }
    const parsed = new URL(this.baseUrl);
    if (parsed.protocol !== 'https:') {
      throw new Error('SAM_API_URL must use HTTPS');
    }
  }

  async downloadAttachment(url) {
    try {
      const parsed = new URL(url);
      const allowed = (process.env.SAM_ATTACHMENT_ALLOWED_HOSTS || 'sam.gov,www.sam.gov,api.sam.gov')
        .split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
      if (parsed.protocol !== 'https:' || !allowed.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
        throw new Error('Attachment host is not allowed');
      }
      const response = await axios.get(parsed.toString(), {
        responseType: 'arraybuffer',
        timeout: 15000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
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
