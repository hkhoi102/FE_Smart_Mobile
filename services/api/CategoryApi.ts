import ApiClient from './ApiClient';

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  message?: string;
  total?: number;
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  size?: number;
}

class CategoryApi {
  private apiClient: typeof ApiClient;

  constructor() {
    this.apiClient = ApiClient;
  }

  // Get all categories
  async getAllCategories(): Promise<CategoryResponse> {
    try {
      const response = await this.apiClient.get<any>('/api/categories');
      console.log('🔍 Raw API response:', response);

      // Handle different response formats
      if (response.data) {
        // If response has data field, use it
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return { success: true, data: response.data.data };
        }
      }

      // Fallback
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('CategoryApi.getAllCategories error:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<CategoryResponse> {
    try {
      const response = await this.apiClient.get<CategoryResponse>(`/api/categories/${id}`);
      return response.data || { success: false, data: [] };
    } catch (error: any) {
      console.error('CategoryApi.getCategoryById error:', error);
      throw new Error(error.message || 'Failed to fetch category');
    }
  }

  // Create new category
  async createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<CategoryResponse> {
    try {
      const response = await this.apiClient.post<CategoryResponse>('/api/categories', categoryData);
      return response.data || { success: false, data: [] };
    } catch (error: any) {
      console.error('CategoryApi.createCategory error:', error);
      throw new Error(error.message || 'Failed to create category');
    }
  }

  // Update category
  async updateCategory(id: number, categoryData: {
    name: string;
    description?: string;
  }): Promise<CategoryResponse> {
    try {
      const response = await this.apiClient.put<CategoryResponse>(`/api/categories/${id}`, categoryData);
      return response.data || { success: false, data: [] };
    } catch (error: any) {
      console.error('CategoryApi.updateCategory error:', error);
      throw new Error(error.message || 'Failed to update category');
    }
  }

  // Delete category (soft delete)
  async deleteCategory(id: number): Promise<CategoryResponse> {
    try {
      const response = await this.apiClient.delete<CategoryResponse>(`/api/categories/${id}`);
      return response.data || { success: false, data: [] };
    } catch (error: any) {
      console.error('CategoryApi.deleteCategory error:', error);
      throw new Error(error.message || 'Failed to delete category');
    }
  }
}

// Export singleton instance
export default new CategoryApi();
