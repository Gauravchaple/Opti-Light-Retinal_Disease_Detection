import apiClient from '../services/apiClient';

export const predictionApi = {
  /**
   * Submit an OCT scan image for AI prediction
   * Sends multipart/form-data with field name 'file'
   * @param {File} file
   * @returns {Promise<{
   *   id: number,
   *   prediction: string,
   *   confidence: number,
   *   probabilities: { CNV: number, DME: number, DRUSEN: number, NORMAL: number },
   *   message: string,
   *   disclaimer: string
   * }>}
   */
  async createPrediction(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/predictions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch prediction history for the current user
   * @returns {Promise<Array<{
   *   id: number,
   *   image_name: string,
   *   prediction: string,
   *   confidence: number,
   *   cnv_probability: number,
   *   dme_probability: number,
   *   drusen_probability: number,
   *   normal_probability: number,
   *   created_at: string
   * }>>}
   */
  async getPredictionHistory() {
    const response = await apiClient.get('/api/predictions/history');
    return response.data;
  },

  /**
   * Retrieve a single prediction record by ID
   * @param {number|string} id
   */
  async getPrediction(id) {
    const response = await apiClient.get(`/api/predictions/${id}`);
    return response.data;
  },

  /**
   * Delete a prediction record by ID (removes DB record and file on disk)
   * @param {number|string} id
   */
  async deletePrediction(id) {
    const response = await apiClient.delete(`/api/predictions/${id}`);
    return response.data;
  },
};
