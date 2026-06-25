import { SiteHeader } from "@/components/brand/site-header";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="bg-camp flex-1">{children}</main>
    </>
  );
}
