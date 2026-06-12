import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./Root";

// ── Public pages ───────────────────────────────────────────────────
import { Home }               from "./pages/Home";
import { About }              from "./pages/About";
import { Products }           from "./pages/Products";
import { ProductDetail }      from "./pages/ProductDetail";
import { Contact }            from "./pages/Contact";
import { Certificates }       from "./pages/Certificates";
import { Blog }               from "./pages/Blog";
import { BlogDetail }         from "./pages/BlogDetail";
import { DownloadCenter }     from "./pages/DownloadCenter";
import { TradeInformation }   from "./pages/TradeInformation";
import FAQ                    from "./pages/FAQ";
import ExportProcess          from "./pages/ExportProcess";
import IndustriesServed       from "./pages/IndustriesServed";
import QualityControl         from "./pages/QualityControl";
import Sustainability         from "./pages/Sustainability";
import ManufacturingProcess   from "./pages/ManufacturingProcess";

// ── Auth pages ─────────────────────────────────────────────────────
import { Login }              from "./pages/Login";           // User login
import { AdminLogin }         from "./pages/AdminLogin";      // Admin-only login
import { Signup }             from "./pages/Signup";
import { ForgotPassword }     from "./pages/ForgotPassword";

// ── Admin dashboard ────────────────────────────────────────────────
import { Dashboard }          from "./pages/Dashboard";       // Existing admin shell
import { Overview }           from "./pages/dashboard/Overview";
import { Inquiries }          from "./pages/dashboard/Inquiries";
import { DashboardProducts }  from "./pages/dashboard/Products";
import { Buyers }             from "./pages/dashboard/Buyers";
import { Quotations }         from "./pages/dashboard/Quotations";
import { CMS }                from "./pages/dashboard/CMS";
import { Settings }           from "./pages/dashboard/Settings";
import { ActivityLogs }       from "./pages/dashboard/ActivityLogs";

// ── User dashboard ─────────────────────────────────────────────────
import { UserDashboard }      from "./pages/user/UserDashboard";
import { Overview as UserOverview }      from "./pages/user/Overview";
import { MyInquiries }        from "./pages/user/MyInquiries";
import { MyQuotations }       from "./pages/user/MyQuotations";
import { Favorites }          from "./pages/user/Favorites";
import { Notifications }      from "./pages/user/Notifications";
import { UserSettings }       from "./pages/user/UserSettings";
import { UserCertificates }   from "./pages/user/UserCertificates";

// ── Guards ─────────────────────────────────────────────────────────
import { AdminRoute }         from "./components/guards/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // ── Public routes ──────────────────────────────────────────
      { index: true,              Component: Home },
      { path: "about",            Component: About },
      { path: "products",         Component: Products },
      { path: "products/:id",     Component: ProductDetail },
      { path: "contact",          Component: Contact },
      { path: "certificates",     Component: Certificates },
      { path: "downloads",        Component: DownloadCenter },
      { path: "trade-info",       Component: TradeInformation },
      { path: "faq",              Component: FAQ },
      { path: "export-process",   Component: ExportProcess },
      { path: "industries",       Component: IndustriesServed },
      { path: "quality-control",  Component: QualityControl },
      { path: "sustainability",   Component: Sustainability },
      { path: "manufacturing",    Component: ManufacturingProcess },
      { path: "blog",             Component: Blog },
      { path: "blog/:slug",       Component: BlogDetail },

      // ── Auth routes ────────────────────────────────────────────
      { path: "login",            Component: Login },          // User login
      { path: "register",         Component: Signup },         // User registration
      { path: "signup",           Component: Signup },         // Alias for compat
      { path: "forgot-password",  Component: ForgotPassword },
      { path: "admin/login",      Component: AdminLogin },     // Admin-only login

      // ── Admin dashboard at /admin/* ────────────────────────────
      // Wrapped in AdminRoute guard inline via element
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        ),
        children: [
          { index: true,            Component: Overview },
          { path: "inquiries",      Component: Inquiries },
          { path: "products",       Component: DashboardProducts },
          { path: "buyers",         Component: Buyers },
          { path: "quotations",     Component: Quotations },
          { path: "cms",            Component: CMS },
          { path: "settings",       Component: Settings },
          { path: "logs",           Component: ActivityLogs },
        ],
      },

      // ── Legacy /dashboard redirect → /admin ────────────────────
      {
        path: "dashboard",
        element: <Navigate to="/admin" replace />,
      },
      {
        path: "dashboard/*",
        element: <Navigate to="/admin" replace />,
      },

      // ── User portal at /user/* ─────────────────────────────────
      // UserDashboard shell already wraps UserRoute guard internally
      {
        path: "user",
        Component: UserDashboard,
        children: [
          { index: true,              element: <Navigate to="/user/dashboard" replace /> },
          { path: "dashboard",        Component: UserOverview },
          { path: "inquiries",        Component: MyInquiries },
          { path: "quotations",       Component: MyQuotations },
          { path: "favorites",        Component: Favorites },
          { path: "notifications",    Component: Notifications },
          { path: "settings",         Component: UserSettings },
          { path: "certificates",     Component: UserCertificates },
        ],
      },
    ],
  },
]);
