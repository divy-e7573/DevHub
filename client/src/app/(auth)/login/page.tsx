import { Suspense } from "react";
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Welcome back"
      description="Sign in to continue building your developer network."
    >
      <Suspense fallback={<p className="text-sm text-slate-600">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
