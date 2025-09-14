import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Transportation optimization background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-success/80 dark:from-[#111111]/80 dark:via-[#111111]/70 dark:to-[#111111]/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white dark:text-[#79e6f0]">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 dark:bg-[#1a1a1a]/50 dark:border-[#79e6f0]/40 mb-8">
            <span className="text-sm font-medium dark:text-[#79e6f0]">AI-Powered Route Optimization</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Optimize Your
            <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent dark:from-[#79e6f0] dark:to-[#a0e5e0]">
              Delivery Routes
            </span>
            with AI
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 dark:text-[#a0e5e0]/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Reduce travel time, fuel costs, and make deliveries smarter with our 
            AI-driven routing platform. Transform your logistics operations today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 group dark:bg-[#79e6f0] dark:text-[#111111] dark:hover:bg-[#a0e5e0]"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
           
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 dark:text-[#79e6f0]">40%</div>
              <div className="text-white/80 dark:text-[#a0e5e0]/80">Fuel Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 dark:text-[#79e6f0]">60%</div>
              <div className="text-white/80 dark:text-[#a0e5e0]/80">Time Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 dark:text-[#79e6f0]">95%</div>
              <div className="text-white/80 dark:text-[#a0e5e0]/80">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 dark:border-[#79e6f0]/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 dark:bg-[#79e6f0]/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
