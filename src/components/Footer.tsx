import { Github, Mail, Shield, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">RouteAI</h3>
              <p className="text-background/80 mb-4 leading-relaxed">
                Revolutionizing transportation and logistics with AI-powered route 
                optimization. Reduce costs, save time, and improve efficiency with 
                our intelligent routing platform.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#upload"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Upload Data
                  </a>
                </li>
                <li>
                  <a
                    href="#optimization"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Optimization
                  </a>
                </li>
                <li>
                  <a
                    href="#visualization"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Visualization
                  </a>
                </li>
                <li>
                  <a
                    href="#insights"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Insights
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/80 hover:text-background transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/80 hover:text-background transition-colors flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-background/60 text-sm mb-4 md:mb-0">
                © 2024 RouteAI. All rights reserved.
              </div>
              <div className="text-background/60 text-sm">
                Built with ❤️ for smarter logistics
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;