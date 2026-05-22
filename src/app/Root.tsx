import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
const DASH_ROUTES = ["/dashboard"];

export function Root() {
  const location = useLocation();
  const isAuth = AUTH_ROUTES.some(r => location.pathname.startsWith(r));
  const isDash = DASH_ROUTES.some(r => location.pathname.startsWith(r));
  const showShell = !isAuth && !isDash;

  return (
    <div className="flex flex-col min-h-screen bg-[#080808]">
      <ScrollRestoration />
      {showShell && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showShell && <Footer />}
      {showShell && <FloatingWhatsApp />}
    </div>
  );
}
