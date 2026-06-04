import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Link } from "react-router-dom";
import type { UseFormReturn } from "react-hook-form";
import type { LoginInput } from "@/schema/auth.schema";

function LoginForm({
  form,
  onSubmit,
}: {
  form: UseFormReturn<LoginInput>;
  onSubmit: (data: LoginInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email?.message ? (
          <p className="text-xs text-error">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-xs text-error">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs font-medium text-secondary underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full py-5 cursor-pointer bg-primary text-white hover:bg-primary/90 transition-colors duration-300 ease-in-out "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default LoginForm;
