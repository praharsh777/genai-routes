import { useState } from "react";
import { Menu, X, Truck, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Upload Data", href: "#upload" },
    { name: "Optimization", href: "#optimization" },
    { name: "Visualization", href: "#visualization" },
    { name: "Insights", href: "#insights" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 header-blur border-b border-border bg-background dark:bg-[#0b1a2b] transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-[#79e6f0]">RouteAI</h1>
              <p className="text-xs text-muted-foreground dark:text-[#a0e5e0] hidden sm:block">
                Transportation Optimization
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground dark:text-[#a0e5e0] hover:text-foreground dark:hover:text-[#79e6f0] transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full hover:bg-accent dark:hover:bg-[#0c1f34] transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-[#79e6f0]" />
              )}
            </button>
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Button className="btn-primary">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent dark:hover:bg-[#0c1f34] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-[#79e6f0]" /> : <Menu className="w-6 h-6 text-[#79e6f0]" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background dark:bg-[#0b1a2b]/95 backdrop-blur-sm transition-colors">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-muted-foreground dark:text-[#a0e5e0] hover:text-foreground dark:hover:text-[#79e6f0] hover:bg-accent dark:hover:bg-[#0c1f34] rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}

              <div className="px-4 pt-2 flex justify-between items-center">
                <Button className="btn-primary w-full">Get Started</Button>
                <button
                  onClick={toggleDarkMode}
                  className="ml-2 p-2 rounded-full hover:bg-accent dark:hover:bg-[#0c1f34] transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-[#79e6f0]" />
                  )}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
