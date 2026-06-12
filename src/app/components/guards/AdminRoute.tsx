// components/guards/AdminRoute.tsx
// Protects /admin/* routes — redirects non-admins to /admin/login
import { Navigate, useLocation } from "react-router";
import { useAuth, isAdmin } from "../../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#d4a017]/30 border-t-[#d4a017] rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin(userType)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
