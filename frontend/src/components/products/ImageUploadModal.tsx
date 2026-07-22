import { useState, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { productApi } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  productId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImageUploadModal({ isOpen, productId, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const mutation = useMutation({
    mutationFn: (uploadFiles: File[]) => productApi.uploadImages(productId!, uploadFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setFiles([]);
      onClose();
      if (onSuccess) onSuccess();
    }
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  if (!isOpen || !productId) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    if (files.length < 3) return;
    mutation.mutate(files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Upload Product Images</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1">
          {mutation.isError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {(mutation.error as Error).message}
            </div>
          )}

          <div 
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-10 h-10 mb-3 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">Drag and drop images here, or click to select</p>
            <p className="text-xs text-gray-500 mb-4">JPEG, PNG, WEBP (Max 5MB each)</p>
            <input 
              type="file"
              multiple 
              accept="image/*"
              className="hidden" 
              id="file-upload"
              onChange={handleChange}
            />
            <label htmlFor="file-upload" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer font-medium text-sm">
              Browse Files
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images ({files.length})</h4>
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border border-gray-200">
                    <span className="text-sm text-gray-600 truncate mr-4">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm flex items-center">
            {files.length < 3 ? (
              <span className="text-amber-600 flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-1" />
                Minimum 3 images required ({3 - files.length} more)
              </span>
            ) : (
              <span className="text-green-600 font-medium">Ready to upload</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Skip for Now
            </button>
            <button
              onClick={onSubmit}
              disabled={files.length < 3 || mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {mutation.isPending ? "Uploading..." : "Upload Images"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
