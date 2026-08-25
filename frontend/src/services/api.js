import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {
  // Revenue Recovery Endpoints (Track 03)
  async getRecoveryItems(status = null, category = null) {
    let url = `${API_BASE}/api/recovery/items`;
    const params = [];
    if (status) params.push(`status=${status}`);
    if (category) params.push(`category=${category}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await axios.get(url);
    return res.data;
  },

  async executeSingleRecovery(itemId) {
    const res = await axios.post(`${API_BASE}/api/recovery/execute/${itemId}`);
    return res.data;
  },

  async executeBatchRecovery(payload = {}) {
    const res = await axios.post(`${API_BASE}/api/recovery/batch`, payload);
    return res.data;
  },

  async recordPromiseToPay(payload) {
    const res = await axios.post(`${API_BASE}/api/recovery/promise-to-pay`, payload);
    return res.data;
  },

  async getRecoveryMetrics() {
    const res = await axios.get(`${API_BASE}/api/recovery/metrics`);
    return res.data;
  },

  async resetRecoveryDemo() {
    const res = await axios.post(`${API_BASE}/api/recovery/reset`);
    return res.data;
  },

  // Customer & Account
  async getCustomer(customerId) {
    const res = await axios.get(`${API_BASE}/customers/${customerId}`);
    return res.data;
  },

  async getAccount(customerId) {
    const res = await axios.get(`${API_BASE}/credit-limit/${customerId}`);
    return res.data;
  },

  async getCards(customerId) {
    const res = await axios.get(`${API_BASE}/cards/${customerId}`);
    return res.data;
  },

  // AI Chat & Workflow
  async sendChatMessage(payload) {
    const res = await axios.post(`${API_BASE}/chat/message`, payload);
    return res.data;
  },

  // Governance Audit Logs
  async getAuditLogs(page = 1, pageSize = 50) {
    const res = await axios.get(`${API_BASE}/governance/audit-logs?page=${page}&page_size=${pageSize}`);
    return res.data;
  },

  async getCustomerAuditLogs(customerId) {
    const res = await axios.get(`${API_BASE}/governance/audit-logs/${customerId}`);
    return res.data;
  },

  // Escalation Queue
  async getEscalations(status = null) {
    const url = status 
      ? `${API_BASE}/governance/escalations?status=${status}` 
      : `${API_BASE}/governance/escalations`;
    const res = await axios.get(url);
    return res.data;
  },

  async updateEscalation(escalationId, payload) {
    const res = await axios.patch(`${API_BASE}/governance/escalations/${escalationId}`, payload);
    return res.data;
  }
};
