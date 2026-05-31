import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../pages/Auth/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import EmailVerificationPage from "@/pages/Auth/EmailVerificationPage";
import VerificationSuccessPage from "@/pages/Auth/VerificationSuccessPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";
import IsLoggedIn from "./privateRoutes/isLoggedIn";
import NotFoundPage from "@/pages/NotFoundPage";
import ChatLayout from "@/pages/Chat/ChatLayout";
import ChatPage from "@/pages/Chat/ChatPage";
import  KnowledgeBasePage from "@/pages/KnowledgeBase/KnowledgeBasePage";
import AdminPage from "@/pages/Admin/AdminPage";
import UserSettingsPage from "@/pages/Users/UserSettingsPage";


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
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    element: <IsLoggedIn />,
    children: [
      {
        path: "/",
        element: <Navigate to="/chat" replace />,
      },
      {
        element: <ChatLayout />,
        children: [
          {
            path: "/chat",
            element: <ChatPage />,
          },
          {
            path: "/chat/new",
            element: <ChatPage />,
          },
          {
            path: "/chat/:chatId",
            element: <ChatPage />,
          },
          {
            path: "/knowledge-base",
            element: <KnowledgeBasePage/>,
          },
          {
            path: "/admin",
                element: <AdminPage/>,
          },
          {
            path: "/settings",
            element: <UserSettingsPage/>,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

