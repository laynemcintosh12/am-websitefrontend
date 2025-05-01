import axios from "axios";

const BASE_URL = process.env.NODE_ENV === 'production'
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000/api';

class Api {
  static token;

  static async request(endpoint, data = {}, method = "get") {
    const url = `${BASE_URL}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`,
      "Content-Type": "application/json",
    };

    const params = method === "get" ? data : {};

    try {
      const response = await axios({ url, method, data, params, headers });
      return response.data;
    } catch (err) {
      console.error("API Error:", err);
      throw err.response?.data?.error || err.message;
    }
  }

  // Commission Routes
  static async getUserCommissions() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData?.user?.id) {
      throw new Error('User ID not found');
    }
    return await this.request("commissions", { user_id: userData.user.id });
  }

  static async getAllCommissions() {
    return await this.request("commissions/all");
  }

  static async getCommissionById(id) {
    return await this.request(`commissions/${id}`);
  }

  static async addCommission(data) {
    return await this.request("commissions", data, "post");
  }

  static async updateCommission(id, data) {
    return await this.request(`commissions/${id}`, data, "put");
  }

  static async deleteCommission(id) {
    return await this.request(`commissions/${id}`, {}, "delete");
  }

  static async getUserPayments() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData?.user?.id) {
      throw new Error('User ID not found');
    }
    return await this.request("payments", { user_id: userData.user.id });
  }

  static async getAllPayments() {
    return await this.request("payments/all");
  }

  static async addPayment(data) {
    return await this.request("payments", data, "post");
  }

  static async getPaymentDetails(paymentId) {
    return await this.request(`payments/${paymentId}/details`);
  }

  static async getUserBalance() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData?.user?.id) {
      throw new Error('User ID not found');
    }
    return await this.request("balance", { user_id: userData.user.id });
  }

  static async getAllUserBalances() {
    return await this.request("balance/all");
  }

  static async getUserCommissionSummary() {
    return await this.request("summary");
  }

  static async getAllCommissionSummary() {
    return await this.request("summary/all");
  }

  static async processCustomerFinalized(customerId) {
    return await this.request(`process-customer/${customerId}`, {}, "post");
  }

  static async calculatePotentialCommissions(customerIds, specificUserId = null) {
    const userData = JSON.parse(localStorage.getItem('user'));
    // Use specificUserId if provided, otherwise fallback to localStorage user
    const userId = specificUserId || userData?.user?.id;
    
    if (!userId) {
      throw new Error('User ID not found');
    }
  
    return await this.request(
      "commissions/calculate-potential",
      { 
        customerIds: Array.isArray(customerIds) ? customerIds : [customerIds],
        user_id: userId
      },
      "post"
    );
  }

  // User Routes
  static async registerUser(data) {
    console.log('Original data:', data); // Debug log
    
    const formattedData = {
      ...data,
      hire_date: data.hireDate ? new Date(data.hireDate).toISOString() : null,
      yearly_goal: Number(data.yearlyGoal || 50000.00),
    };
    
    console.log('Formatted data:', formattedData); // Debug log
    return await this.request("users/register", formattedData, "post");
  }

  static async loginUser(data) {
    return await this.request("users/login", data, "post");
  }

  static async forgotPassword(data) {
    return await this.request("users/forgot-password", data, "post");
  }

  static async resetPassword(data) {
    return await this.request("users/reset-password", data, "post");
  }

  static async getAllUsers() {
    return await this.request("users");
  }

  static async getUserDetails(query) {
    // If query contains userId, map it to id
    const params = query.userId ? { id: query.userId } : query;
    return await this.request("users/details", params);
  }

  static async updateUserDetails(userId, data) {
    return await this.request(`users/${userId}`, data, "put");
  }

  static async updatePassword(userId, data) {
    return await this.request(`users/${userId}/password`, data, "put");
  }

  static async deleteUserById(userId) {
    return await this.request(`users/${userId}`, {}, "delete");
  }

  // Customer Routes
  static async syncCustomers() {
    return await this.request("customers/sync", {}, "post");
  }

  /**
   * Adds a new customer to JobNimbus CRM
   * Required fields:
   * @param {Object} data
   * @param {string} data.firstName - Customer's first name
   * @param {string} data.lastName - Customer's last name
   * @param {string} data.phone - Mobile phone number
   * @param {string} data.address - Street address
   * @param {string} data.city - City name
   * @param {string} data.state - State abbreviation (e.g., 'KY')
   * @param {string} data.zip - ZIP code
   * @param {string} data.email - Email address
   * @param {string} data.leadSource - Source of the lead
   * @param {string} data.referrer - Name of person who referred
   * @returns {Promise} Created customer data and associated task
   */
  static async addCustomerToJobNimbus(customerData) {
    return await this.request(
      "customers/jobnimbus",
      customerData,
      "post"
    );
  }

  static async getCustomers() {
    return await this.request("customers");
  }

  static async searchCustomers(query) {
    return await this.request("customers/search", { q: query });
  }

  static async searchCustomers(query, userId) {
    return await this.request("customers/search", { 
      q: query,
      userId: userId 
    });
  }

  static async getCustomer(customerId) {
    return await this.request(`customers/${customerId}`);
  }

  static async deleteCustomer(customerId) {
    return await this.request(`customers/${customerId}`, {}, "delete");
  }

  // Team Routes
  static async createTeam(data) {
    try {
      console.log('API createTeam called with:', data);
      const response = await this.request("teams", {
        managerId: parseInt(data.manager_id),  // Changed from data.managerId
        teamName: data.team_name,              // Changed from data.teamName
        teamType: data.team_type,              // Changed from data.teamType
        salesmanIds: data.salesman_ids || [],  // Changed from data.salesmanIds
        supplementerIds: data.supplementer_ids || [] // Changed from data.supplementerIds
      }, "post");
      return response;
    } catch (error) {
      console.error('API createTeam error:', error);
      throw error;
    }
  }

  static async updateTeam(teamData) {
    console.log('API updateTeam called with:', teamData);
    return await this.request(`teams`, {
      team_id: teamData.team_id,
      team_name: teamData.team_name,
      team_type: teamData.team_type,
      manager_id: teamData.manager_id,
      salesman_ids: teamData.salesman_ids,
      supplementer_ids: teamData.supplementer_ids
    }, "put");
  }

  static async getTeams() {
    return await this.request("teams");
  }

  static async deleteTeam(teamId) {
    return await this.request(`teams/${teamId}`, {}, "delete");
  }

  static async getTeamCustomers(teamId) {
    return await this.request(`teams/${teamId}/customers`);
  }

  static async getTeamPerformanceMetrics(teamId) {
    return await this.request(`teams/${teamId}/performance`);
  }

  static async getUserCommissionSummary(userId) {
    return await this.request(`summary`, { user_id: userId });
  }

  static async sendEmail(data) {
    return await this.request('email/send', data, 'post');
  }
}

export default Api;
