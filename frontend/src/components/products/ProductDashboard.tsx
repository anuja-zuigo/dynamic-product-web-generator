import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { 
  ModuleRegistry, 
  ClientSideRowModelModule, 
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  PaginationModule
} from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../lib/api";
import type { Product } from "../../types/product";
import { Plus, Edit2, Image as ImageIcon, Send, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductFormModal from "./ProductFormModal";
import ImageUploadModal from "./ImageUploadModal";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule, 
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  PaginationModule
]);

export default function ProductDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalProductId, setImageModalProductId] = useState<string | null>(null);

  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getProducts
  });

  const aiReviewMutation = useMutation({
    mutationFn: (id: string) => productApi.triggerAI(id),
    onSuccess: (reports: any[], id: string) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      const reviewReport = reports.find((r: any) => r.agent_name === "review");
      if (reviewReport) {
        navigate(`/dashboard/products/${id}/review`);
      } else {
        // Pipeline failed early (validation or image analysis rejected it)
        const failedReport = [...reports].reverse().find((r: any) => r.output && r.output.passed === false);
        if (failedReport && failedReport.output.issues) {
          const issuesText = failedReport.output.issues.map((i: any) => `- ${i.description}`).join('\n');
          alert(`AI Pipeline rejected the product during ${failedReport.agent_name}:\n\n${issuesText}`);
        } else {
          alert("AI Pipeline failed to complete the enrichment process.");
        }
      }
    },
    onError: (err: any) => {
      alert(err.message || "Failed to trigger AI pipeline");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const colDefs: ColDef<Product>[] = [
    { field: "sku", headerName: "SKU", filter: true, sortable: true, width: 150 },
    { field: "title", headerName: "Title", filter: true, sortable: true, flex: 1 },
    { field: "category", headerName: "Category", filter: true, sortable: true, width: 150 },
    { field: "price", headerName: "Price", filter: true, sortable: true, width: 120, valueFormatter: (p) => p.value ? `$${p.value.toFixed(2)}` : '-' },
    { 
      field: "status", 
      headerName: "Status", 
      filter: true, 
      sortable: true, 
      width: 150,
      cellRenderer: (params: any) => {
        const colorClass = params.value === 'published' ? 'bg-green-100 text-green-800' 
                         : params.value === 'draft' ? 'bg-gray-100 text-gray-800'
                         : 'bg-yellow-100 text-yellow-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {params.value}
          </span>
        );
      }
    },
    {
      headerName: "Images",
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        const product = params.data as Product;
        const images = product.images || [];
        if (images.length === 0) {
          return <span className="text-gray-400 text-xs italic">No images</span>;
        }
        
        const primaryImage = images.find(img => img.is_primary) || images[0];
        
        return (
          <div className="flex items-center space-x-2 h-full">
            <img 
              src={`${primaryImage.imagekit_url}?tr=w-32,h-32,fo-auto`} 
              alt="Thumbnail" 
              className="w-8 h-8 rounded object-cover border border-gray-200"
            />
            <span className="text-xs text-gray-500 font-medium">({images.length})</span>
          </div>
        );
      }
    },
    { field: "availability", headerName: "Availability", filter: true, sortable: true, width: 150 },
    {
      headerName: "Actions",
      width: 250,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        const product = params.data as Product;
        return (
          <div className="flex items-center space-x-2 h-full">
            <button 
              onClick={() => { setSelectedProduct(product); setIsFormModalOpen(true); }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Edit Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setImageModalProductId(product.id); setIsImageModalOpen(true); }}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Upload Images"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this product?")) {
                  deleteMutation.mutate(product.id);
                }
              }}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Product"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {product.status !== 'ai_processing' && (
              <button 
                onClick={() => aiReviewMutation.mutate(product.id)}
                disabled={aiReviewMutation.isPending}
                className={`flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                  aiReviewMutation.isPending && aiReviewMutation.variables === product.id
                    ? 'bg-indigo-100 text-indigo-500 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {aiReviewMutation.isPending && aiReviewMutation.variables === product.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing... (30s+)
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    {product.status === 'draft' ? 'Trigger AI' : 'Re-trigger AI'}
                  </>
                )}
              </button>
            )}
            
            {product.status === 'user_review' && (
              <button 
                onClick={() => navigate(`/dashboard/products/${product.id}/review`)}
                className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
              >
                Review Report
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { setSelectedProduct(null); setIsFormModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            Error loading products: {(error as Error).message}
          </div>
        ) : (
          <div className="ag-theme-alpine flex-1 w-full">
            <AgGridReact
              theme="legacy"
              rowData={products}
              columnDefs={colDefs}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[20, 50, 100]}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true
              }}
            />
          </div>
        )}
      </div>

      <ProductFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
        initialData={selectedProduct}
        onSuccess={(id) => {
          // Sequential Modal approach: When product saves, auto open the image modal
          setImageModalProductId(id);
          setIsImageModalOpen(true);
        }}
      />
      
      <ImageUploadModal
        isOpen={isImageModalOpen}
        productId={imageModalProductId}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={() => {
           // Wait for explicit trigger of AI Review from table actions for now,
           // or we could auto-trigger. 
        }}
      />
    </div>
  );
}
