import { Outlet } from "react-router-dom";
import AuthSideDesign from "./AuthSideDesign";

function AuthLayout() {
  return (
    <div className="min-h-svh w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-480">
        <div className="hidden md:block md:w-2/5">
          <AuthSideDesign />
        </div>
        <div className="flex w-full items-center justify-center p-6 md:w-3/5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;