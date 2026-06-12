// pages/user/UserCertificates.tsx
// Redirects to the shared public certificates page.
// Users access the same content but from their dashboard context.
import { Navigate } from "react-router";

export function UserCertificates() {
  return <Navigate to="/certificates" replace />;
}
