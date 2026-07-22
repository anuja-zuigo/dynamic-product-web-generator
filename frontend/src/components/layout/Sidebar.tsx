import { Link, useLocation } from "react-router-dom";
import { Package, ShieldCheck, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Products", path: "/dashboard/products", icon: Package, roles: ["user", "admin"] },
    { name: "Admin Review", path: "/dashboard/admin", icon: ShieldCheck, roles: ["admin"] },
    { name: "Settings", path: "/dashboard/settings", icon: Settings, roles: ["user", "admin"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          ProductGen AI
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 group ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={user?.email}>
              {user?.email}
            </span>
            <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-gray-500 font-medium px-2 mb-2">Build Status</div>
        <div className="flex items-center px-2 text-sm text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Backend API Connected
        </div>
      </div>
    </aside>
  );
}
