import clsx from "clsx";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AppShell() {
  const location = useLocation();
  const isDashboardView =
    location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-100" />
      <div className="pointer-events-none absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:90px_90px]" />
      <Navbar />
      <main className={clsx("relative z-10", isDashboardView ? "pb-24 pt-28" : "pb-24")}>
        <Outlet />
      </main>
    </div>
  );
}
