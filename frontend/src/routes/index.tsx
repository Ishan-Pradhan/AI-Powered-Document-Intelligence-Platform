import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Eagerly loaded (auth + layout shells — small, needed immediately)
import AuthLayout from "../pages/Auth/AuthLayout";
import IsLoggedIn from "./privateRoutes/isLoggedIn";
import Loading from "@/components/loading/Loading";

// Lazy-loaded pages
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const EmailVerificationPage = lazy(() => import("@/pages/Auth/EmailVerificationPage"));
const VerificationSuccessPage = lazy(() => import("@/pages/Auth/VerificationSuccessPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/Auth/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ChatLayout = lazy(() => import("@/pages/Chat/ChatLayout"));
const ChatPage = lazy(() => import("@/pages/Chat/ChatPage"));
const KnowledgeBasePage = lazy(() => import("@/pages/KnowledgeBase/KnowledgeBasePage"));
const AdminPage = lazy(() => import("@/pages/Admin/AdminPage"));
const UserSettingsPage = lazy(() => import("@/pages/Users/UserSettingsPage"));
const WidgetChatPage = lazy(() => import("@/pages/Chat/WidgetChatPage"));

const PageLoader = () => (
  <div className="h-lvh">
    <Loading />
  </div>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: withSuspense(<LoginPage />) },
      { path: "/register", element: withSuspense(<RegisterPage />) },
      { path: "/verify-email", element: withSuspense(<EmailVerificationPage />) },
      { path: "/verify-success", element: withSuspense(<VerificationSuccessPage />) },
      { path: "/forgot-password", element: withSuspense(<ForgotPasswordPage />) },
      { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
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
        element: withSuspense(<ChatLayout />),
        children: [
          { path: "/chat", element: withSuspense(<ChatPage />) },
          { path: "/chat/new", element: withSuspense(<ChatPage />) },
          { path: "/chat/:chatId", element: withSuspense(<ChatPage />) },
          { path: "/knowledge-base", element: withSuspense(<KnowledgeBasePage />) },
          { path: "/admin", element: withSuspense(<AdminPage />) },
          { path: "/settings", element: withSuspense(<UserSettingsPage />) },
        ],
      },
    ],
  },
  {
    path: "/widget/chat",
    element: withSuspense(<WidgetChatPage />),
  },
  {
    path: "*",
    element: withSuspense(<NotFoundPage />),
  },
]);
