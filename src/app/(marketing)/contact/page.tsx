import type { Metadata } from "next";
import { Mail, MessageCircle, LifeBuoy } from "lucide-react";
import { PageHero } from "@/components/brand/prose";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact & support",
  description: "Get in touch with the SquatchScout team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Get in touch"
        subtitle="Questions, feedback or a tricky booking? We're here to help."
      />
      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <form className="space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="How can we help?" />
          </div>
          <Button type="submit" className="w-full">
            Send message
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Form delivery is wired up in a later phase.
          </p>
        </form>

        <div className="space-y-4">
          <ContactCard icon={<Mail />} title="Email us" body="hello@squatchscout.com" />
          <ContactCard icon={<MessageCircle />} title="In-app chat" body="Message your pro right from a booking." />
          <ContactCard icon={<LifeBuoy />} title="Help center" body="Guides for customers and Scout Pros." />
        </div>
      </div>
    </>
  );
}

function ContactCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <span className="flex size-10 items-center justify-center rounded-xl bg-orange-soft text-orange-dark [&_svg]:size-5">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
