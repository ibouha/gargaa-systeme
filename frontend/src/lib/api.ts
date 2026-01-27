const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || 'Erreur de requête');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(nom_utilisateur: string, mot_de_passe: string): Promise<ApiResponse & { token?: string; user?: unknown }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nom_utilisateur, mot_de_passe }),
    });
  }

  // Clients
  async getClients(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/clients${query}`);
  }

  async getClient(id: number) {
    return this.request(`/clients/${id}`);
  }

  async getClientExpeditions(id: number) {
    return this.request(`/clients/${id}/expeditions`);
  }

  async createClient(data: Record<string, unknown>) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: Record<string, unknown>) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: number) {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  // Expéditions
  async getExpeditions(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/expeditions${query}`);
  }

  async getExpedition(id: number) {
    return this.request(`/expeditions/${id}`);
  }

  async getAlertes() {
    return this.request('/expeditions/alertes');
  }

  async createExpedition(data: Record<string, unknown>) {
    return this.request('/expeditions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpedition(id: number, data: Record<string, unknown>) {
    return this.request(`/expeditions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpedition(id: number) {
    return this.request(`/expeditions/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardEvolution() {
    return this.request('/dashboard/evolution');
  }

  // Chauffeurs
  async getChauffeurs(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/chauffeurs${query}`);
  }

  async getChauffeur(id: number) {
    return this.request(`/chauffeurs/${id}`);
  }

  async createChauffeur(data: Record<string, unknown>) {
    return this.request('/chauffeurs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChauffeur(id: number, data: Record<string, unknown>) {
    return this.request(`/chauffeurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChauffeur(id: number) {
    return this.request(`/chauffeurs/${id}`, { method: 'DELETE' });
  }

  // PDF
  getFactureUrl(id: number): string {
    return `${API_URL}/pdf/facture/${id}?token=${this.getToken()}`;
  }

  async exportListePDF(filters: Record<string, unknown>) {
    const token = this.getToken();
    const response = await fetch(`${API_URL}/pdf/liste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filters),
    });
    return response.blob();
  }

  // Categories Frais
  async getCategoriesFrais(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/categories-frais${query}`);
  }

  async getCategorieFrais(id: number) {
    return this.request(`/categories-frais/${id}`);
  }

  async createCategorieFrais(data: Record<string, unknown>) {
    return this.request('/categories-frais', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategorieFrais(id: number, data: Record<string, unknown>) {
    return this.request(`/categories-frais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategorieFrais(id: number) {
    return this.request(`/categories-frais/${id}`, { method: 'DELETE' });
  }

  // Frais (Expenses)
  async getFrais(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/frais${query}`);
  }

  async getFraisStats(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/frais/stats${query}`);
  }

  async getFraisById(id: number) {
    return this.request(`/frais/${id}`);
  }

  async createFrais(data: Record<string, unknown>) {
    return this.request('/frais', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFrais(id: number, data: Record<string, unknown>) {
    return this.request(`/frais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFrais(id: number) {
    return this.request(`/frais/${id}`, { method: 'DELETE' });
  }

  async exportFraisPDF(filters: Record<string, unknown>) {
    const token = this.getToken();
    const response = await fetch(`${API_URL}/frais-pdf/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filters),
    });
    return response.blob();
  }

  // Devis
  async getDevis(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/devis${query}`);
  }

  async getDevisById(id: number) {
    return this.request(`/devis/${id}`);
  }

  async createDevis(data: Record<string, unknown>) {
    return this.request('/devis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDevis(id: number, data: Record<string, unknown>) {
    return this.request(`/devis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDevis(id: number) {
    return this.request(`/devis/${id}`, { method: 'DELETE' });
  }

  getDevisPdfUrl(id: number): string {
    return `${API_URL}/pdf/devis/${id}?token=${this.getToken()}`;
  }

  // Next Numbers
  async getNextDevisNumber() {
    return this.request<{ nextNumero: string }>('/devis/next-number');
  }

  async getNextExpeditionNumber() {
    return this.request<{ nextNumero: string }>('/expeditions/next-number');
  }
}

export const api = new ApiClient();

