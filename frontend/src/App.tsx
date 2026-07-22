import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProductDashboard from "./components/products/ProductDashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import { useAuth } from "./context/AuthContext";
import AIReviewScreen from "./components/products/AIReviewScreen";
import TemplateSelection from "./components/templates/TemplateSelection";
import PreviewPage from "./components/templates/PreviewPage";

// Placeholders for Phase 2 components
const AdminDashboard = () => <div className="p-4">Admin Dashboard (Pending Queue)</div>;
const Settings = () => <div className="p-4">Settings Screen</div>;

// Root index redirect based on role
const IndexRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/dashboard/products" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public only routes (redirect to dashboard if logged in) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected Dashboard shell */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<IndexRedirect />} />
            <Route path="products" element={<ProductDashboard />} />
            <Route path="products/:id/review" element={<AIReviewScreen />} />
            <Route path="products/:id/templates" element={<TemplateSelection />} />
            <Route path="products/:id/preview" element={<PreviewPage />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Admin only routes */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
