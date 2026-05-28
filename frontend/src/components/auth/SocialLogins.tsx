import { Button } from "../ui/button";
import type { FieldValues, UseFormReturn } from "react-hook-form"
import { oauthUrl } from "@/api/auth";
import googleLogo from "@/assets/google.svg";
import githubLogo from "@/assets/github.svg";


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
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start py-6 flex gap-2 cursor-pointer text-charcoal-900 "
        disabled={form.formState.isSubmitting}
        onClick={() => startOAuth("google")}
      >
    <img src={googleLogo} alt="Google logo" className="w-5 h-5" />
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start py-6 cursor-pointer text-charcoal-900 "
        disabled={form.formState.isSubmitting}
        onClick={() => startOAuth("github")}
      >
    <img src={githubLogo} alt="GitHub logo" className="w-5 h-5" />
        Continue with GitHub
      </Button>
    </div>
  );
}

export default SocialLogins;