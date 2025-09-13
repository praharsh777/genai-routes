import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import ResultsDashboard from "@/components/ResultsDashboard";
import VisualizationSection from "@/components/VisualizationSection";
import InsightsSection from "@/components/InsightsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <UploadSection />
      <ResultsDashboard />
      <InsightsSection />
      <Footer />
    </div>
  );
};

export default Index;
