import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Certificates } from "./pages/Certificates";
import { Blog } from "./pages/Blog";
import { BlogDetail } from "./pages/BlogDetail";
import { Dashboard } from "./pages/Dashboard";
import { DownloadCenter } from "./pages/DownloadCenter";
import { TradeInformation } from "./pages/TradeInformation";
import FAQ from "./pages/FAQ";
import ExportProcess from "./pages/ExportProcess";
import IndustriesServed from "./pages/IndustriesServed";
import QualityControl from "./pages/QualityControl";
import Sustainability from "./pages/Sustainability";
import ManufacturingProcess from "./pages/ManufacturingProcess";
import { Overview } from "./pages/dashboard/Overview";
import { Inquiries } from "./pages/dashboard/Inquiries";
import { DashboardProducts } from "./pages/dashboard/Products";
import { Buyers } from "./pages/dashboard/Buyers";
import { Quotations } from "./pages/dashboard/Quotations";
import { CMS } from "./pages/dashboard/CMS";
import { Settings } from "./pages/dashboard/Settings";
import { ActivityLogs } from "./pages/dashboard/ActivityLogs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "contact", Component: Contact },
      { path: "certificates", Component: Certificates },
      { path: "downloads", Component: DownloadCenter },
      { path: "trade-info", Component: TradeInformation },
      { path: "faq", Component: FAQ },
      { path: "export-process", Component: ExportProcess },
      { path: "industries", Component: IndustriesServed },
      { path: "quality-control", Component: QualityControl },
      { path: "sustainability", Component: Sustainability },
      { path: "manufacturing", Component: ManufacturingProcess },
      { path: "blog", Component: Blog },
      { path: "blog/:slug", Component: BlogDetail },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
      {
        path: "dashboard",
        Component: Dashboard,
        children: [
          { index: true, Component: Overview },
          { path: "inquiries", Component: Inquiries },
          { path: "products", Component: DashboardProducts },
          { path: "buyers", Component: Buyers },
          { path: "quotations", Component: Quotations },
          { path: "cms", Component: CMS },
          { path: "settings", Component: Settings },
          { path: "logs", Component: ActivityLogs },
        ],
      },
    ],
  },
]);
