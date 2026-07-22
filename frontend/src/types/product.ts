export type ProductStatus = 
  | "draft"
  | "submitted"
  | "ai_processing"
  | "user_review"
  | "admin_review"
  | "published";

export type ProductAvailability = "active" | "offline";

export interface ProductImage {
  id: string;
  product_id: string;
  imagekit_url: string;
  imagekit_file_id: string;
  is_primary: boolean;
  position: number;
  created_at: string;
}

export interface Product {
  id: string;
  owner_id: string;
  sku: string;
  title: string | null;
  short_description: string | null;
  long_description: string | null;
  category: string | null;
  price: number | null;
  status: ProductStatus;
  availability: ProductAvailability;
  is_deleted: boolean;
  selected_template_id: string | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface CreateProductPayload {
  sku: string;
  title?: string;
  category?: string;
  price?: number;
  short_description?: string;
}
