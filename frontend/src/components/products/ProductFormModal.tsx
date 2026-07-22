import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../lib/api";
import type { Product, CreateProductPayload } from "../../types/product";
import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product | null;
  onSuccess?: (productId: string) => void;
}

export default function ProductFormModal({ isOpen, onClose, initialData, onSuccess }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductPayload>();

  useEffect(() => {
    if (initialData) {
      reset({
        sku: initialData.sku,
        title: initialData.title || "",
        category: initialData.category || "",
        price: initialData.price || undefined,
        short_description: initialData.short_description || "",
      });
    } else {
      reset({ sku: "", title: "", category: "", price: undefined, short_description: "" });
    }
  }, [initialData, reset, isOpen]);

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      if (onSuccess) onSuccess(data.id);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productApi.updateProduct(initialData!.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      if (onSuccess) onSuccess(data.id);
    }
  });

  const mutation = initialData ? updateMutation : createMutation;

  if (!isOpen) return null;

  const onSubmit = (data: CreateProductPayload) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {mutation.isError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {(mutation.error as Error).message}
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                {...register("sku", { required: "SKU is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. TSHIRT-001"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register("title")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Basic Cotton T-Shirt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  {...register("category")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Fashion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                {...register("short_description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A brief description of the product..."
              />
            </div>
            
            {!initialData && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Image upload (ImageKit integration) will be handled in a subsequent step.
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
