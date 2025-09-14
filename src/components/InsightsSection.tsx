import { Cpu, Map, Truck, Zap, Award } from "lucide-react";

const InsightsSection = () => {
  const steps = [
    {
      title: "1. Input Delivery Data",
      description: "Upload your delivery points or enter locations manually. The app supports multiple vehicles and dynamic stops.",
      icon: Map,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "2. AI Optimization",
      description: "Generative AI computes the optimal routes considering distance, time, and traffic patterns to save fuel and reduce cost.",
      icon: Cpu,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "3. Route Assignment",
      description: "Vehicles are assigned routes efficiently. You can view all stops and sequences in a clear, interactive table.",
      icon: Truck,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "4. Achieve Results",
      description: "See the results visually: reduced distance, faster delivery, lower costs, and improved operational efficiency.",
      icon: Zap,
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "5. Optimized Performance",
      description: "With AI insights, your logistics become smarter. Improve driver efficiency, save money, and scale operations effortlessly.",
      icon: Award,
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  return (
    <section id="insights" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How Our App Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the AI-powered route optimization process and the impact it brings to your logistics.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="saas-card-lg p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 ${step.color}`}>
                <step.icon className="w-8 h-8"/>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">What You Achieve</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="saas-card-lg p-6 rounded-xl bg-blue-50 text-blue-700">
              <Zap className="w-10 h-10 mx-auto mb-3"/>
              <h4 className="text-xl font-semibold mb-1">Reduced Delivery Time</h4>
              <p className="text-sm">Faster deliveries with AI-optimized routes.</p>
            </div>
            <div className="saas-card-lg p-6 rounded-xl bg-green-50 text-green-700">
              <Truck className="w-10 h-10 mx-auto mb-3"/>
              <h4 className="text-xl font-semibold mb-1">Lower Fuel Cost</h4>
              <p className="text-sm">Minimized travel distance saves fuel and money.</p>
            </div>
            <div className="saas-card-lg p-6 rounded-xl bg-purple-50 text-purple-700">
              <Cpu className="w-10 h-10 mx-auto mb-3"/>
              <h4 className="text-xl font-semibold mb-1">Smart AI Insights</h4>
              <p className="text-sm">Data-driven insights for operational improvement.</p>
            </div>
            <div className="saas-card-lg p-6 rounded-xl bg-yellow-50 text-yellow-700">
              <Award className="w-10 h-10 mx-auto mb-3"/>
              <h4 className="text-xl font-semibold mb-1">Enhanced Efficiency</h4>
              <p className="text-sm">Boost your logistics performance with measurable results.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
