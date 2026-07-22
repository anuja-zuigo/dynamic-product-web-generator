import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layout, MousePointerClick } from "lucide-react";

const TEMPLATES = [
  { id: "electronics", name: "Electronics Store", color: "bg-blue-100" },
  { id: "fashion", name: "Fashion Boutique", color: "bg-pink-100" },
  { id: "medical", name: "Medical Devices", color: "bg-emerald-100" },
  { id: "corporate", name: "Corporate Services", color: "bg-slate-100" },
  { id: "b2b", name: "B2B Wholesale", color: "bg-orange-100" },
  { id: "minimal", name: "Minimalist Gallery", color: "bg-gray-100" }
];

export default function TemplateSelection() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Output Template</h2>
          <p className="text-sm text-gray-500">Choose a design system for generating the final web pages</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className={`h-40 ${tpl.color} flex items-center justify-center`}>
                <Layout className="w-12 h-12 text-gray-400 opacity-50" />
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-800">{tpl.name}</span>
                <button 
                  onClick={() => alert(`Selected ${tpl.name} template (Phase 6 mock)`)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                >
                  <MousePointerClick className="w-4 h-4 mr-1" />
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
