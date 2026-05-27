import { Button } from "../ui/button";
import type { FieldValues, UseFormReturn } from "react-hook-form"
import { oauthUrl } from "@/api/auth";

type SocialLoginsProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  setSubmitError: (error: string | null) => void
}

function SocialLogins<TFieldValues extends FieldValues>({
  form,
  setSubmitError
}: SocialLoginsProps<TFieldValues>) {

  const startOAuth = (provider: "google" | "github") => {
    setSubmitError(null)
    window.location.assign(oauthUrl(provider))
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        disabled={form.formState.isSubmitting}
        onClick={() => startOAuth("google")}
      >
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        disabled={form.formState.isSubmitting}
        onClick={() => startOAuth("github")}
      >
        Continue with GitHub
      </Button>
    </div>
  );
}

export default SocialLogins;