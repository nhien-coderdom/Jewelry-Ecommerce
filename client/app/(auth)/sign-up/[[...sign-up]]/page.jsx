import { SignUp } from "@clerk/nextjs";
import SyncClerkUser from "../../../_components/SyncClerkUser";

export default function Page() {
  return (
    <section className="min-h-screen md:py-8 flex justify-center items-center">
      <SignUp afterSignUpUrl="/" />
      <SyncClerkUser />
    </section>
  );
}

