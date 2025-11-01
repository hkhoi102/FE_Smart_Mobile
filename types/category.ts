// Category types for API integration
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithColor extends Category {
  bgColor: string;
  borderColor: string;
  image: any; // For React Native Image source
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
