import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../lib/api";
import { Check, Edit2, AlertTriangle, ArrowLeft, Send } from "lucide-react";

export default function AIReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const all = await productApi.getProducts();
      return all.find(p => p.id === id);
    }
  });

  const { data: aiReport, isLoading: loadingReport } = useQuery({
    queryKey: ["ai_report", id],
    queryFn: () => productApi.getAIReport(id!),
    enabled: !!id
  });

  const submitToAdminMutation = useMutation({
    mutationFn: () => productApi.updateProductStatus(id!, "admin_review"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/dashboard/products");
    }
  });

  // State to hold the accepted/edited values before final submission
  const [editedFields, setEditedFields] = useState<any>({});
  // Track which fields have been "accepted"
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (aiReport?.enriched_fields) {
      setEditedFields(aiReport.enriched_fields);
    }
  }, [aiReport]);

  if (loadingProduct || loadingReport) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product || !aiReport) {
    return <div className="p-6 text-red-500">Failed to load product or AI report.</div>;
  }

  const handleFieldChange = (key: string, value: any) => {
    setEditedFields((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleAccept = (key: string) => {
    setAcceptedFields((prev: Record<string, boolean>) => ({ ...prev, [key]: true }));
  };

  const allFieldsAccepted = Object.keys(editedFields).every(key => acceptedFields[key]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Review: {product.title}</h2>
            <p className="text-sm text-gray-500">Review AI suggestions and enrichments before admin approval</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${aiReport.confidence_score >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            Confidence Score: {(aiReport.confidence_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Synthesis Report Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50">
            <h3 className="font-semibold text-indigo-900">Agent 5 Synthesis Report</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{aiReport.summary}</p>
              
              {aiReport.warnings && aiReport.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <h4 className="text-sm font-medium text-yellow-800 flex items-center mb-1">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Warnings
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                    {aiReport.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Changes Made</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {aiReport.changes_made.map((c, i) => (
                  <li key={i} className="flex flex-col p-2 bg-gray-50 rounded border border-gray-100">
                    <span className="font-medium text-gray-800 capitalize mb-1">{c.field}</span>
                    <span className="text-gray-500 line-through truncate">{c.before || '(empty)'}</span>
                    <span className="text-green-700 truncate">{c.after}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Field Review List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Review Enriched Fields</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(editedFields).map(([key, value]) => {
              const isAccepted = acceptedFields[key];
              const isList = Array.isArray(value);
              const isObject = typeof value === 'object' && !isList && value !== null;
              
              return (
                <div key={key} className={`p-6 flex flex-col md:flex-row gap-6 transition-colors ${isAccepted ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                  <div className="md:w-1/4">
                    <span className="text-sm font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="md:w-2/4">
                    {isList ? (
                      <textarea 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                        rows={4}
                        value={(value as string[]).join('\n')}
                        onChange={(e) => handleFieldChange(key, e.target.value.split('\n'))}
                        disabled={isAccepted}
                      />
                    ) : isObject ? (
                      <textarea 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono" 
                        rows={4}
                        value={JSON.stringify(value, null, 2)}
                        onChange={(e) => {
                          try {
                            handleFieldChange(key, JSON.parse(e.target.value));
                          } catch (e) {
                            // wait for valid JSON
                          }
                        }}
                        disabled={isAccepted}
                      />
                    ) : (
                      <textarea 
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                        rows={3}
                        value={value as string}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        disabled={isAccepted}
                      />
                    )}
                  </div>
                  <div className="md:w-1/4 flex items-start justify-end space-x-2">
                    {isAccepted ? (
                      <button 
                        onClick={() => setAcceptedFields((prev: Record<string, boolean>) => ({ ...prev, [key]: false }))}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-md bg-white shadow-sm"
                      >
                        <Edit2 className="w-4 h-4 mr-1.5" />
                        Edit Again
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAccept(key)}
                        className="flex items-center text-sm text-green-700 hover:text-green-800 hover:bg-green-100 px-3 py-1.5 border border-green-200 rounded-md bg-green-50 shadow-sm"
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Accept Field
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer Action Bar */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-between items-center z-10">
        <div className="text-sm text-gray-500">
          {Object.keys(acceptedFields).filter(k => acceptedFields[k]).length} of {Object.keys(editedFields).length} fields accepted
        </div>
        <button
          onClick={() => submitToAdminMutation.mutate()}
          disabled={!allFieldsAccepted || submitToAdminMutation.isPending}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
        >
          {submitToAdminMutation.isPending ? "Submitting..." : "Submit to Admin Review"}
          <Send className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
