"use client";

import { useActionState, useState } from "react";
import { Tag, Lock } from "lucide-react";
import { applyPromo, payBooking, type PromoState, type PayState } from "@/app/checkout/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn, formatPrice } from "@/lib/utils";

const round = (n: number) => Math.round(n * 100) / 100;
const TIP_PCTS = [0, 0.1, 0.15, 0.2];

export function CheckoutForm({
  bookingId,
  subtotal,
  feeRate,
}: {
  bookingId: string;
  subtotal: number;
  feeRate: number;
}) {
  const [tip, setTip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const [promoState, applyAction] = useActionState<PromoState, FormData>(
    async (prev, fd) => {
      const res = await applyPromo(prev, fd);
      if (res.ok && res.discount != null) {
        setDiscount(res.discount);
        setAppliedCode(res.code ?? "");
      }
      return res;
    },
    {},
  );

  const [payState, payAction] = useActionState<PayState, FormData>(payBooking, {});

  const serviceTotal = round(Math.max(0, subtotal - discount));
  const fee = round(serviceTotal * feeRate);
  const total = round(serviceTotal + tip);

  return (
    <div className="space-y-5">
      {/* Promo */}
      <form action={applyAction} className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Tag className="size-4" /> Promo code
        </label>
        <input type="hidden" name="booking_id" value={bookingId} />
        <div className="flex gap-2">
          <Input name="code" placeholder="SCOUT10" defaultValue={appliedCode} className="uppercase" />
          <Button type="submit" variant="outline">Apply</Button>
        </div>
        {promoState.message && (
          <p className={cn("mt-2 text-sm", promoState.ok ? "text-success" : "text-destructive")}>
            {promoState.message}
          </p>
        )}
      </form>

      {/* Tip */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="mb-3 text-sm font-semibold text-ink">Add a tip for your pro</p>
        <div className="flex flex-wrap gap-2">
          {TIP_PCTS.map((pct) => {
            const value = round(subtotal * pct);
            const active = tip === value;
            return (
              <button
                key={pct}
                type="button"
                onClick={() => setTip(value)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "border-primary bg-orange-soft text-orange-dark" : "border-border text-ink hover:border-ink/30",
                )}
              >
                {pct === 0 ? "No tip" : `${pct * 100}%`}
                {pct > 0 && <span className="ml-1 text-muted-foreground">{formatPrice(value)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary + pay */}
      <form action={payAction} className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <input type="hidden" name="booking_id" value={bookingId} />
        <input type="hidden" name="tip" value={tip} />
        <input type="hidden" name="code" value={appliedCode} />

        {payState.error && <Alert variant="error" className="mb-4">{payState.error}</Alert>}

        <dl className="space-y-2 text-sm">
          <Row label="Service" value={formatPrice(subtotal)} />
          {discount > 0 && <Row label="Promo discount" value={`− ${formatPrice(discount)}`} />}
          <Row label={`Platform fee (${Math.round(feeRate * 100)}%)`} value={`included`} muted />
          {tip > 0 && <Row label="Tip" value={formatPrice(tip)} />}
          <div className="my-1 border-t border-border" />
          <Row label="Total" value={formatPrice(total)} strong />
        </dl>

        <p className="mt-1 text-xs text-muted-foreground">
          Held safely until the job is done — your pro is paid {formatPrice(round(serviceTotal - fee + tip))} on completion.
        </p>

        <SubmitButton size="lg" className="mt-5 w-full">
          <Lock /> Pay {formatPrice(total)}
        </SubmitButton>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Demo checkout — no real card is charged.
        </p>
      </form>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          strong ? "font-mono text-base font-semibold text-ink" : "font-medium text-ink",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
