import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import CreateWishPage from "./pages/CreateWishPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PreviewWishPage from "./pages/PreviewWishPage.jsx";
import PublicWishPage from "./pages/PublicWishPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="badge">Lost in stardust</span>
      <h1 className="text-4xl font-semibold text-white">Page not found</h1>
      <p className="max-w-xl text-white/70">
        The link may have expired, or the celebration path has moved.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create"
          element={
            <ProtectedRoute>
              <CreateWishPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/preview/:id"
          element={
            <ProtectedRoute>
              <PreviewWishPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/wish/:slug" element={<PublicWishPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
