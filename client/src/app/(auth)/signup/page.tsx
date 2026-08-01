import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      description="Join DevHub and start building your developer presence."
    >
      <SignupForm />
    </AuthPageLayout>
  );
}
