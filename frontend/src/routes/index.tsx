import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../pages/Auth/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import EmailVerificationPage from "@/pages/Auth/EmailVerificationPage";
import VerificationSuccessPage from "@/pages/Auth/VerificationSuccessPage";
import RequireAuth from "./privateRoutes/isLoggedIn";


export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
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
        path: "/verify-success",
        element: <VerificationSuccessPage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
    ],
  },
]);
