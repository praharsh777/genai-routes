import { useEffect, useState } from "react";

interface Contributor {
  name: string;
  role: string;
  image: string; // URL or local path
  roll: string;
}

const contributors: Contributor[] = [
  { name: "M PRAHARSH", role: "Full Stack Dev", image: "/praharsh.jpg", roll: "22J41A6730" },
  { name: "M SREEJA", role: "ML Engineer", image: "/sreeja.jpg", roll: "22J41A6732" },
  { name: "K RAHUL", role: "Backend Dev", image: "/rahul.jpg", roll: "22J41A6728" },
  { name: "M VARSHINI", role: "Frontend Dev", image: "varshini.jpg", roll: "22J41A6738" },
  { name: "M KABILAN", role: "UI/UX Designer", image: "/kabilan.jpg", roll: "22J41A6729" },
  { name: "M NIVAS", role: "Data Scientist", image: "/nivas.jpg", roll: "22J41A6739" },
  { name: "N HEMANTH", role: "DevOps Engineer", image: "/hemanth.jpg", roll: "22J41A6741" },
];

interface AboutSectionProps {
  isVisible?: boolean; // toggle visibility
}

const AboutSection = ({ isVisible = true }: AboutSectionProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 50); // delay for smooth animation
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  return (
    <section
      id="about"
      className={`py-20 bg-muted/20 dark:bg-[#0c1f34] transition-colors`}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-foreground dark:text-[#79e6f0] mb-6">
          About & Contributors
        </h2>
        <p className="max-w-3xl mx-auto text-muted-foreground dark:text-[#a0e5e0] mb-12">
          RouteAI is a project focused on transportation optimization using AI and advanced routing algorithms. Below are our core contributors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {contributors.map((c, idx) => (
            <div
              key={c.name}
              className={`bg-background dark:bg-[#0b1a2b] p-4 rounded-lg shadow-lg flex flex-col items-center
              transform transition-all duration-700 ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              `}
              style={{ transitionDelay: `${idx * 100}ms` }} // stagger animation
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-24 h-24 rounded-full mb-2 object-cover"
              />
              <h4 className="font-semibold text-foreground dark:text-[#79e6f0]">{c.name}</h4>
              <p className="text-sm text-muted-foreground dark:text-[#a0e5e0] mb-1">{c.role}</p>
              <p className="text-xs text-muted-foreground dark:text-[#a0e5e0]">{c.roll}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
