import { registerUser } from "@/api/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { registerSchema, type RegisterInput } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthCardLayout from "./AuthCardLayout";

export default function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      confirmPassword: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: RegisterInput) => {
    setSubmitError(null);

    try {
      const response = await registerUser(values);
      setUser(response.data.data);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      return;
    }

    navigate("/verify-email", { state: { email: values.email } });
  };

  return (
    <AuthCardLayout
      form={form}
      submitError={submitError}
      setSubmitError={setSubmitError}
      type="register"
    >
      <RegisterForm onSubmit={onSubmit} form={form} />
    </AuthCardLayout>
  );
}
