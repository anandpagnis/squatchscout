import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/brand/prose";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SquatchScout collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle="Last updated June 24, 2026" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Prose>
          <p>
            This policy explains what we collect and why. It&apos;s a placeholder for the
            foundation build — replace with a counsel-reviewed policy before launch.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>Account details: name, email, phone.</li>
            <li>Booking details: service, address and job notes.</li>
            <li>Pro verification: ID and insurance documents (stored privately).</li>
            <li>Payment metadata via Stripe (we never store card numbers).</li>
          </ul>
          <h2>How we use it</h2>
          <p>
            To match customers with pros, process bookings and payments, prevent fraud,
            and improve the Service.
          </p>
          <h2>Your rights</h2>
          <p>
            You can request a copy of your data or ask us to delete your account, subject
            to legal retention requirements (GDPR/CCPA).
          </p>
          <h2>Security</h2>
          <p>
            Data is encrypted in transit, access is governed by row-level security, and
            verification documents are served only via signed URLs.
          </p>
        </Prose>
      </div>
    </>
  );
}
