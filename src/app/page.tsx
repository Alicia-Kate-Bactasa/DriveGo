import { PageShell } from "@/components/layout/header-wrapper";
import { Hero } from "@/components/layout/hero";
import { AboutSection } from "@/components/home/about-section";
import { CategoryGrid } from "@/components/category/category-grid";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <AboutSection />
      <CategoryGrid />
    </PageShell>
  );
}