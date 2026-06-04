import SocialLogins from "@/components/auth/SocialLogins";
import { Card, CardContent } from "@/components/ui/card";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";

type AuthCardLayoutProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  submitError: string | null;
  setSubmitError: (error: string | null) => void;
  children: React.ReactNode;
  type: "login" | "register";
};

function AuthCardLayout<T extends FieldValues>({
  form,
  submitError,
  setSubmitError,
  children,
  type,
}: AuthCardLayoutProps<T>) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <Card className="w-full max-w-md ring-0 ">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in.
          </p>
        </div>

        <CardContent className="pt-4 ">
          <div className="grid gap-3">
            <SocialLogins form={form} setSubmitError={setSubmitError} />

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {children}

            {submitError ? (
              <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {submitError}
              </div>
            ) : null}

            <p className="text-center text-sm text-muted-foreground">
              {type === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                to={type === "login" ? "/register" : "/login"}
                className="font-medium text-secondary underline-offset-4 hover:underline"
              >
                {type === "login" ? "Sign up" : "Sign in"}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthCardLayout;
