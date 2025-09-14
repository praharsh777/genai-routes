import { Github, Shield, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-[#e0f7f7] py-12 dark:bg-[#111111] dark:text-[#79e6f0]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">RouteAI</h3>
              <p className="text-[#e0f7f7]/80 dark:text-[#a0e5e0]/80 mb-4 leading-relaxed">
                Revolutionizing transportation and logistics with AI-powered route 
                optimization. Reduce costs, save time, and improve efficiency with 
                our intelligent routing platform.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/praharsh777/genai-routes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#e0f7f7]/10 hover:bg-[#e0f7f7]/20 dark:bg-[#79e6f0]/20 dark:hover:bg-[#79e6f0]/40 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5 dark:text-[#111111]" />
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
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
                  >
                    Upload Data
                  </a>
                </li>
                <li>
                  <a
                    href="#optimization"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
                  >
                    Optimization
                  </a>
                </li>
                <li>
                  <a
                    href="#visualization"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
                  >
                    Visualization
                  </a>
                </li>
                <li>
                  <a
                    href="#insights"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
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
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] flex items-center transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] flex items-center transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#e0f7f7]/80 hover:text-[#e0f7f7] dark:text-[#79e6f0]/80 dark:hover:text-[#79e6f0] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#e0f7f7]/20 dark:border-[#79e6f0]/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-[#e0f7f7]/60 dark:text-[#79e6f0]/50 text-sm mb-4 md:mb-0">
              </div>
              <div className="text-[#e0f7f7]/60 dark:text-[#79e6f0]/50 text-sm">
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
