import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admin", label: "Admin" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleLinks = navLinks.filter((link) => {
    if (link.to === "/admin") {
      return user?.role === "admin";
    }

    if (link.to === "/dashboard") {
      return Boolean(user);
    }

    return true;
  });

  if (location.pathname.startsWith("/wish/")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 shadow-glow backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <Sparkles className="h-5 w-5" />
          </span>
          Birthday Glow
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "text-cyan-200"
                  : "text-white/70 transition hover:text-white"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="button-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button-secondary">
                Login
              </Link>
              <Link to="/signup" className="button-primary">
                Start Creating
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-5 shadow-glow backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-white/80"
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="button-secondary w-full justify-center"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="button-secondary justify-center">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="button-primary justify-center">
                  Start Creating
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
