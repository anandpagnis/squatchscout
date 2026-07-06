import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CATEGORIES } from "@/lib/catalog";
import { brand } from "@/lib/brand";

// Demo mode hides links to pages with placeholder content (blog, legal).
// The pages themselves stay routable — flip the env var to bring them back.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-cream-soft">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-soft">{brand.tagline}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Vetted, insured and background-checked local pros.
            </p>
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
            <FooterLink href="/pricing">Pricing & fees</FooterLink>
            {!DEMO_MODE && <FooterLink href="/blog">Blog</FooterLink>}
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            {!DEMO_MODE && (
              <>
                <FooterLink href="/legal/terms">Terms</FooterLink>
                <FooterLink href="/legal/privacy">Privacy</FooterLink>
              </>
            )}
            <FooterLink href="/trust-safety">Trust & safety</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
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
      <h4 className="font-display text-sm font-bold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ink-soft transition-colors hover:text-orange-dark">
        {children}
      </Link>
    </li>
  );
}
