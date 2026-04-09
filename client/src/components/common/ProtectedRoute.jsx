import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function PageLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="glass-panel flex items-center gap-3 px-6 py-4 text-sm text-white/75">
        <span className="h-3 w-3 animate-ping rounded-full bg-cyan-300" />
        Loading celebration console...
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
