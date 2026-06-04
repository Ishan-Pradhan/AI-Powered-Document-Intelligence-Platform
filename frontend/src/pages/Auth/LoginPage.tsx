import { login } from "@/api/auth";
import LoginForm from "@/components/auth/LoginForm";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { loginSchema, type LoginInput } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCardLayout from "./AuthCardLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");

  const [submitError, setSubmitError] = useState<string | null>(errorParam);

  const [prevErrorParam, setPrevErrorParam] = useState<string | null>(
    errorParam,
  );

  if (errorParam !== prevErrorParam) {
    setPrevErrorParam(errorParam);
    setSubmitError(errorParam);
  }

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginInput) => {
    setSubmitError(null);

    try {
      const response = await login(values);

      setUser(response.data.data);

      const redirect = import.meta.env.VITE_AUTH_SUCCESS_REDIRECT as
        | string
        | undefined;

      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      return;
    }
  };
  return (
    <AuthCardLayout
      form={form}
      submitError={submitError}
      setSubmitError={setSubmitError}
      type="login"
    >
      <LoginForm form={form} onSubmit={onSubmit} />
    </AuthCardLayout>
  );
}
