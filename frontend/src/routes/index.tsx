import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import EmailVerificationPage from "@/pages/Auth/EmailVerificationPage";


export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <EmailVerificationPage />,
  },
  {
    path: "/",
    element: <DashboardPage />,
  },
]);
