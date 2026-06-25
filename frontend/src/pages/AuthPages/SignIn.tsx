import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta title="Futsal Court Booking FCFS" description="Made with tailadmin by Rio Thung" />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
