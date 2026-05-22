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
      { path: "dashboard", Component: Dashboard },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
    ],
  },
]);
