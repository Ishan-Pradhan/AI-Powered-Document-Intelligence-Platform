import { type UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { RegisterInput } from "@/schema/auth.schema";

function RegisterForm({
  form,
  onSubmit,
}: {
  form: UseFormReturn<RegisterInput>;
  onSubmit: (values: RegisterInput) => Promise<void>;
}) {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          className="py-4"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name?.message ? (
          <p className="text-xs text-error">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="py-4"
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
          className="py-4"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-xs text-error">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          className="py-4"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message ? (
          <p className="text-xs text-error">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full py-5 cursor-pointer bg-primary text-white hover:bg-primary/90 transition-colors duration-300 ease-in-out  "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export default RegisterForm;
