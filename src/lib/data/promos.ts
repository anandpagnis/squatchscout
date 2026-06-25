import { createClient } from "@/lib/supabase/server";

export type PromoResult =
  | { valid: false; message: string }
  | { valid: true; id: string; code: string; discount: number; message: string };

/** Validate a promo code against a subtotal (server-side). */
export async function validatePromo(
  rawCode: string,
  subtotal: number,
): Promise<PromoResult> {
  const code = rawCode.trim();
  if (!code) return { valid: false, message: "Enter a code" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("id, code, type, value, min_subtotal, max_uses, used_count, expires_at, active")
    .eq("code", code)
    .maybeSingle();

  const promo = data as
    | {
        id: string;
        code: string;
        type: "percent" | "fixed";
        value: number;
        min_subtotal: number | null;
        max_uses: number | null;
        used_count: number;
        expires_at: string | null;
        active: boolean;
      }
    | null;

  if (!promo || !promo.active) return { valid: false, message: "That code isn't valid" };
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return { valid: false, message: "That code has expired" };
  if (promo.max_uses != null && promo.used_count >= promo.max_uses)
    return { valid: false, message: "That code is no longer available" };
  if (promo.min_subtotal != null && subtotal < promo.min_subtotal)
    return { valid: false, message: `Spend at least $${promo.min_subtotal} to use this code` };

  const discount =
    promo.type === "percent"
      ? Math.round(subtotal * (promo.value / 100) * 100) / 100
      : Math.min(promo.value, subtotal);

  return {
    valid: true,
    id: promo.id,
    code: promo.code,
    discount,
    message: `Code applied — you saved $${discount.toFixed(2)}`,
  };
}
