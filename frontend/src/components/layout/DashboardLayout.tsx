import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">ProductGen AI PIM</h1>
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 truncate max-w-[200px]">
              {user?.email || "Not signed in"}
            </button>
            <UserCircle className="w-8 h-8 text-gray-400" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
