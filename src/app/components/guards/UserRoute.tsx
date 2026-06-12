// components/guards/UserRoute.tsx
// Protects /user/* routes — redirects unauthenticated visitors to /login
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface UserRouteProps {
  children: React.ReactNode;
}

export function UserRoute({ children }: UserRouteProps) {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#070707" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#d4a017]/30 border-t-[#d4a017] rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (!user || userType !== 'user') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
