import Navbar from "./Navbar";
import HeroSection from "@components/home/HeroSection";
import ProductPreview from "@components/home/ProductPreviewSection";
import StatsSection from "@components/home/StatsSection";
import QuestionAnswer from "@components/home/QuestionAnswerSection";
import HowItWorks from "@components/home/HowItWorksSection";
import WhyVentureStrat from "@components/home/WhyVenturStratSection";
import Resources from "@components/home/ResourcesSection";
import Pricing from "@components/home/PricingSection";
import FAQ from "@components/home/FaqSection";
import Footer from "./home/FooterSection";


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
      <HowItWorks />
      <WhyVentureStrat />
      <Resources />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
