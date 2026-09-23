import apiClient from '../services/apiClient';

export const authApi = {
  /**
   * Authenticate user using OAuth2 password flow (username=email, password)
   * Sends application/x-www-form-urlencoded matching backend's OAuth2PasswordRequestForm
   * @returns {Promise<{ access_token: string, token_type: string }>}
   */
  async login(email, password) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await apiClient.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Register a new user
   * @returns {Promise<{ id: number, name: string, email: string, created_at: string }>}
   */
  async register(name, email, password) {
    const response = await apiClient.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile
   * @returns {Promise<{ id: number, name: string, email: string, created_at: string }>}
   */
  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};
