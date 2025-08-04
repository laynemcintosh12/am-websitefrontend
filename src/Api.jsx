import axios from "axios";

const BASE_URL = process.env.NODE_ENV === 'production'
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000/api';

class Api {
  static token;

  static async request(endpoint, data = {}, method = "get") {
    const url = `${BASE_URL}/${endpoint}`;
    console.log(`API Request: ${method.toUpperCase()} ${url}`, data); // ADD THIS LINE
    
    const headers = {
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`,
      "Content-Type": "application/json",
    };

    const params = method === "get" ? data : {};

    try {
      const response = await axios({ url, method, data, params, headers });
      console.log(`API Response: ${method.toUpperCase()} ${url}`, response.data); // ADD THIS LINE
      return response.data;
    } catch (err) {
      console.error("API Error:", err);
      console.error("Full error details:", err.response); // ADD THIS LINE
      throw err.response?.data?.error || err.message;
    }
  }

  // Commission Routes
  static async getUserCommissions(userId) {
    if (!userId) {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.user?.id) {
        throw new Error('User ID not found');
      }
      userId = userData.user.id;
    }
    return await this.request("commissions", { user_id: userId });
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
    if (!userData?.token) {
      throw new Error('Authentication token not found');
    }
    
    this.token = userData.token;
    return await this.request("payments");
  }

  static async getAllPayments() {
    return await this.request("payments/all");
  }

  static async addPayment(data) {
    return await this.request("payments", data, "post");
  }

  static async updatePayment(paymentId, data) {
    return await this.request(`payments/${paymentId}`, data, "put");
  }

  static async deletePayment(paymentId) {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    
    try {
      return await this.request(`payments/${paymentId}`, {}, 'delete');
    } catch (error) {
      // If it's a 404, the payment was already deleted
      if (error.includes('not found') || error.includes('404')) {
        throw new Error('Payment has already been deleted');
      }
      throw error;
    }
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
    // Handle different input types for getUserDetails
    let params = {};
    
    if (typeof query === 'number' || (typeof query === 'string' && !isNaN(query))) {
      // If it's a number or numeric string, treat it as an ID
      params = { id: query };
    } else if (typeof query === 'object' && query !== null) {
      // If it's an object, use it directly but map userId to id if needed
      params = query.userId ? { id: query.userId } : query;
    } else if (typeof query === 'string') {
      // If it's a string that contains @, treat as email, otherwise as name
      if (query.includes('@')) {
        params = { email: query };
      } else {
        params = { name: query };
      }
    }
    
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

  // Email Routes
  static async sendEmail(data) {
    return await this.request('email/send', data, 'post');
  }

  static async reportIssue(data) {
    return await this.request('email/report-issue', data, 'post');
  }

  // Team Member Routes
  static async getUserTeam(userId) {
    return await this.request(`teams/user/${userId}`);
  }

  static async getUserTeamsWithHistory(userId, options = {}) {
    const params = { 
      historicalDate: options.historicalDate,
      includeHistory: options.includeHistory
    };
    return await this.request(`teams/users/${userId}/teams`, params);
  }

  static async getTeamMembers(teamId, options = {}) {
    return await this.request(`teams/${teamId}/members`, options);
  }

  static async getTeamMembershipHistory(teamId) {
    return await this.request(`teams/${teamId}/membership-history`);
  }

  static async addUserToTeam(userData) {
    return await this.request("teams/membership", userData, "post");
  }

  static async addUserToTeamWithDate(userData) {
    // POST /api/teams/membership/dated
    return await this.request("teams/membership/dated", userData, "post");
  }

  static async setUserTeamDepartureDate(userId, teamId, departureData) {
    // PUT /api/teams/membership/:userId/:teamId/departure
    return await this.request(`teams/membership/${userId}/${teamId}/departure`, departureData, "put");
  }

  static async removeUserFromTeam(userId, teamId) {
    return await this.request(`teams/membership/${userId}/${teamId}`, {}, "delete");
  }

  static async updateUserRoleInTeam(userId, teamId, roleData) {
    // PUT /api/teams/membership/:userId/:teamId/role
    return await this.request(`teams/membership/${userId}/${teamId}/role`, roleData, "put");
  }

  static async checkUserTeamMembershipAtDate(userId, teamId, date) {
    return await this.request(`teams/membership/${userId}/${teamId}/check`, { date });
  }

  static async bulkUpdateTeamMemberships(teamId, membershipData) {
    return await this.request(`teams/${teamId}/memberships`, membershipData, "put");
  }

  static async removeUserFromAllTeams(userId) {
    return await this.request(`teams/users/${userId}/memberships`, {}, "delete");
  }
}

export default Api;
