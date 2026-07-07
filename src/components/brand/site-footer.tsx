import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/catalog";
import { brand } from "@/lib/brand";

// Demo mode hides links to pages with placeholder content (blog, legal).
// The pages themselves stay routable — flip the env var to bring them back.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function SiteFooter() {
  return (
    <footer className="bg-lodge texture-grain">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <Logo onDark />
            <p className="mt-4 max-w-xs text-sm text-paper/75">{brand.tagline}</p>
            <div className="mt-6 space-y-2.5 text-xs text-paper/60">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-moss" aria-hidden />
                Vetted, insured &amp; background-checked pros
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-moss" aria-hidden />
                Serving the Pacific Northwest
              </p>
            </div>
          </div>

          <FooterCol title="Popular services">
            {CATEGORIES.slice(0, 6).map((c) => (
              <FooterLink key={c.slug} href={`/services/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/for-contractors">Become a pro</FooterLink>
            <FooterLink href="/pricing">Pricing &amp; fees</FooterLink>
            {!DEMO_MODE && <FooterLink href="/blog">Blog</FooterLink>}
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterCol>

          <FooterCol title="Trust">
            <FooterLink href="/trust-safety">Trust &amp; safety</FooterLink>
            {!DEMO_MODE && (
              <>
                <FooterLink href="/legal/terms">Terms</FooterLink>
                <FooterLink href="/legal/privacy">Privacy</FooterLink>
              </>
            )}
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-paper/15 pt-6 text-xs text-paper/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}. Book local help without the hunt.</p>
          <p>Made in the Pacific Northwest 🌲</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{title}</h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-paper/75 transition-colors hover:text-paper"
      >
        {children}
      </Link>
    </li>
  );
}
