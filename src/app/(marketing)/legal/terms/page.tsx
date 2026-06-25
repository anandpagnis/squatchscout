import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/brand/prose";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of SquatchScout.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" subtitle="Last updated June 24, 2026" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Prose>
          <p>
            These Terms govern your use of SquatchScout (the &quot;Service&quot;). By
            creating an account or booking a pro, you agree to them. This is a
            placeholder for the foundation build — replace with counsel-reviewed terms
            before launch.
          </p>
          <h2>1. Accounts</h2>
          <p>
            You&apos;re responsible for your account and for keeping your credentials
            secure. You must be 18+ to use the Service.
          </p>
          <h2>2. Marketplace role</h2>
          <p>
            SquatchScout connects customers with independent contractors (&quot;Scout
            Pros&quot;). Pros are not employees of SquatchScout. We facilitate booking and
            payment but do not perform the services ourselves.
          </p>
          <h2>3. Payments</h2>
          <p>
            Payments are processed by Stripe. SquatchScout charges a platform fee on
            completed bookings and pays out the remainder to the pro.
          </p>
          <h2>4. Cancellations & refunds</h2>
          <p>
            Cancellation and refund eligibility depend on timing and job status, as
            described at checkout.
          </p>
          <h2>5. Conduct</h2>
          <ul>
            <li>No fraudulent, abusive or illegal activity.</li>
            <li>No circumventing the platform to avoid fees.</li>
            <li>Reviews must reflect genuine experiences.</li>
          </ul>
          <h2>6. Liability</h2>
          <p>
            The Service is provided &quot;as is.&quot; To the extent permitted by law,
            SquatchScout&apos;s liability is limited.
          </p>
        </Prose>
      </div>
    </>
  );
}
