import Navbar from "./Navbar";
import HeroSection from "@components/home/HeroSection";
import ProductPreview from "@components/home/ProductPreview";
import StatsSection from "@components/home/StatsSection";
import QuestionAnswer from "@components/home/QuestionAnswer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dots">
      <div className="sticky top-[28px] z-50 w-[80%] mx-auto">
        <Navbar />
      </div>

      <HeroSection />
      <ProductPreview />
      <StatsSection />
      <QuestionAnswer />
    </main>
  );
}
