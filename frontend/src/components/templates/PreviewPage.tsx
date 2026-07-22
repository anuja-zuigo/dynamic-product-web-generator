import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dynamic Page Preview</h2>
            <p className="text-sm text-gray-500">Previewing product ID: {id}</p>
          </div>
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button className="p-2 bg-white rounded shadow-sm text-indigo-600"><Monitor className="w-4 h-4" /></button>
          <button className="p-2 text-gray-500 hover:text-gray-900"><Tablet className="w-4 h-4" /></button>
          <button className="p-2 text-gray-500 hover:text-gray-900"><Smartphone className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center overflow-y-auto">
        <div className="bg-white shadow-xl rounded-b-md w-full max-w-5xl h-[800px] border-t-8 border-indigo-500 relative flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">Phase 6 Template Render Area</h1>
            <p className="text-gray-400">The actual dynamic react components will render here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
