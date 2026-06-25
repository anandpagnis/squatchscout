import "server-only";

/**
 * Payment provider abstraction. The marketplace charges the customer, keeps a
 * platform fee, and pays out the contractor (escrow released on completion).
 *
 * A mock provider is used until Stripe keys are configured, so checkout works
 * end-to-end locally with no external account. Drop in a Stripe Connect
 * implementation behind the same interface when STRIPE_SECRET_KEY is set.
 */
export interface ChargeInput {
  amount: number; // total charged to the customer, USD
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  id: string;
  status: "succeeded";
}

export interface PaymentProvider {
  readonly name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(intentId: string): Promise<{ id: string; status: "refunded" }>;
}

const mockProvider: PaymentProvider = {
  name: "mock",
  async charge() {
    return { id: `mock_pi_${crypto.randomUUID()}`, status: "succeeded" };
  },
  async refund(intentId) {
    return { id: intentId, status: "refunded" };
  },
};

export function getPaymentProvider(): PaymentProvider {
  // When real keys exist, return a Stripe Connect-backed provider here.
  // if (process.env.STRIPE_SECRET_KEY) return createStripeProvider();
  return mockProvider;
}

export const isMockPayments = !process.env.STRIPE_SECRET_KEY;
