"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewState } from "@/lib/actions/reviews";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action] = useActionState<ReviewState, FormData>(submitReview, {});

  if (state.ok) {
    return <Alert variant="success">Thanks for the review — it helps others scout! 🐾</Alert>;
  }

  return (
    <form action={action} className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">Leave a review</h2>
      {state.error && <Alert variant="error" className="mt-3">{state.error}</Alert>}
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="p-1"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || rating) >= n ? "fill-primary text-primary" : "text-border",
              )}
            />
          </button>
        ))}
      </div>

      <Textarea name="comment" placeholder="How did it go?" className="mt-3" rows={3} />
      <SubmitButton className="mt-4" disabled={rating === 0}>Submit review</SubmitButton>
    </form>
  );
}
