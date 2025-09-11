import { TrendingUp, Award, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const InsightsSection = () => {
  const beforeStats = {
    distance: "245 km",
    time: "8.5 hrs",
    fuel: "₹2,450",
    cost: "₹3,200",
    efficiency: "68%",
  };

  const afterStats = {
    distance: "156 km",
    time: "5.2 hrs",
    fuel: "₹1,560",
    cost: "₹2,080",
    efficiency: "96%",
  };

  const improvements = [
    {
      metric: "Distance Reduction",
      value: "36%",
      icon: Target,
      description: "89 km saved through optimal routing",
    },
    {
      metric: "Time Savings",
      value: "39%",
      icon: Zap,
      description: "3.3 hours faster delivery completion",
    },
    {
      metric: "Cost Reduction",
      value: "35%",
      icon: TrendingUp,
      description: "₹1,120 saved in operational costs",
    },
    {
      metric: "Efficiency Gain",
      value: "+28%",
      icon: Award,
      description: "Improved from 68% to 96% efficiency",
    },
  ];

  return (
    <section id="insights" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Optimization Insights
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See the dramatic impact of AI-powered route optimization on your 
              logistics operations with detailed before and after comparisons.
            </p>
          </div>

          {/* Before vs After Comparison */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Before Optimization */}
            <div className="saas-card-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    Before Optimization
                  </h3>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Inefficient
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Traditional routing approach
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {beforeStats.distance}
                    </div>
                    <div className="text-sm text-red-600">Total Distance</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {beforeStats.time}
                    </div>
                    <div className="text-sm text-red-600">Travel Time</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {beforeStats.fuel}
                    </div>
                    <div className="text-sm text-red-600">Fuel Cost</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {beforeStats.cost}
                    </div>
                    <div className="text-sm text-red-600">Total Cost</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {beforeStats.efficiency}
                  </div>
                  <div className="text-sm text-red-600">Route Efficiency</div>
                </div>
              </div>
            </div>

            {/* After Optimization */}
            <div className="saas-card-lg">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    After AI Optimization
                  </h3>
                  <Badge className="btn-success">
                    <Award className="w-3 h-3 mr-1" />
                    Optimized
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  AI-powered intelligent routing
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-success mb-1">
                      {afterStats.distance}
                    </div>
                    <div className="text-sm text-success">Total Distance</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-success mb-1">
                      {afterStats.time}
                    </div>
                    <div className="text-sm text-success">Travel Time</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-success mb-1">
                      {afterStats.fuel}
                    </div>
                    <div className="text-sm text-success">Fuel Cost</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-success mb-1">
                      {afterStats.cost}
                    </div>
                    <div className="text-sm text-success">Total Cost</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-3xl font-bold text-success mb-1">
                    {afterStats.efficiency}
                  </div>
                  <div className="text-sm text-success">Route Efficiency</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {improvements.map((improvement, index) => (
              <div key={index} className="saas-card-lg p-6 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <improvement.icon className="w-8 h-8 text-success" />
                </div>
                
                <div className="text-3xl font-bold text-success mb-2">
                  {improvement.value}
                </div>
                
                <h4 className="font-semibold text-foreground mb-2">
                  {improvement.metric}
                </h4>
                
                <p className="text-sm text-muted-foreground">
                  {improvement.description}
                </p>
              </div>
            ))}
          </div>

          {/* Summary Banner */}
          <div className="mt-16 bg-gradient-to-r from-primary to-success rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Logistics?
            </h3>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Join hundreds of businesses saving thousands of dollars and hours 
              every month with AI-powered route optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 rounded-lg transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;