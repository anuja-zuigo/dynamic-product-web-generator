import type { Product, CreateProductPayload } from "../types/product";

const API_BASE_URL = "http://localhost:8000";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const productApi = {
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  createProduct: async (data: CreateProductPayload): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        sku: data.sku,
        title: data.title || null,
        category: data.category || null,
        price: data.price || null,
        short_description: data.short_description || null,
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to create product");
    }
    return res.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to update product");
    }
    return res.json();
  },

  updateProductStatus: async (id: string, status: Product["status"]): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to update product status");
    }
    return res.json();
  },

  uploadImages: async (id: string, imageFiles: File[]): Promise<void> => {
    if (imageFiles.length < 3) {
      throw new Error("Minimum 3 images required");
    }

    // 2. Upload to ImageKit and then link to product sequentially or in parallel
    for (const [i, file] of imageFiles.entries()) {
      // 1. Get ImageKit auth params FRESH for each file
      const authRes = await fetch(`${API_BASE_URL}/images/auth`, { headers: getHeaders() });
      if (!authRes.ok) throw new Error("Failed to get image upload token");
      const { token, expire, signature, publicKey } = await authRes.json();

      const formData = new FormData();
      // Use the third argument of append to ensure the correct file is processed by fetch
      formData.append("file", file, file.name);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire.toString());
      formData.append("token", token);
      formData.append("folder", `/productgen/products/${id}`);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload ${file.name} to ImageKit`);
      }

      const uploadData = await uploadRes.json();

      // 3. Associate with product in Neon DB
      const assocRes = await fetch(`${API_BASE_URL}/images/products/${id}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          imagekit_url: uploadData.url,
          imagekit_file_id: uploadData.fileId,
          is_primary: i === 0,
          position: i
        })
      });

      if (!assocRes.ok) {
        throw new Error(`Failed to associate ${file.name} with product`);
      }
    }
  },

  triggerAI: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/ai/products/${id}/trigger`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to trigger AI pipeline");
    }
    return res.json();
  },

  getAIReport: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/ai/products/${id}/reports`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch AI reports");
    
    const reports = await res.json();
    const reviewReport = reports.find((r: any) => r.agent_name === "review");
    
    if (!reviewReport) {
      throw new Error("Review report not found for this product.");
    }
    
    return reviewReport.output;
  }
};
