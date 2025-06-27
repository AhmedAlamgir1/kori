import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, BookOpen, Lightbulb, UserCheck, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/ui/footer";

const LandingPage = () => {
  const navigate = useNavigate();

  const optionCards = [
    // {
    //   id: 1,
    //   title: "Explore Briefs",
    //   icon: <Briefcase className="w-10 h-10 text-white" />,
    //   description: "Coming Soon",
    //   path: "/coming-soon",
    //   delay: 0.1
    // },
    {
      id: 2,
      title: "Understand",
      icon: <BookOpen className="w-10 h-10 text-white" />,
      description: "Your research co-pilot to gain deeper insight to your opportunity or problem",
      path: "/understand",
      delay: 0.2
    },
    {
      id: 3,
      title: "Ideate",
      icon: <Lightbulb className="w-10 h-10 text-white" />,
      description: "Your creative co-pilot to generate digital product solutions to problems",
      path: "/innovate",
      delay: 0.3
    },
    // {
    //   id: 4,
    //   title: "Lead",
    //   icon: <UserCheck className="w-10 h-10 text-white" />,
    //   description: "Coming Soon",
    //   path: "/coming-soon",
    //   delay: 0.4
    // },
    // {
    //   id: 5,
    //   title: "Design",
    //   icon: <PenTool className="w-10 h-10 text-white" />,
    //   description: "Coming Soon",
    //   path: "/coming-soon",
    //   delay: 0.5
    // }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white flex flex-col">
      <div className="absolute w-full h-full overflow-hidden z-0">
        <div className="stars-container"></div>
      </div>

      <main className="flex-1 flex flex-col items-center px-4 pt-16 pb-4 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-relaxed animate-text-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-300% relative py-2">
            Hello Innovator, what are we building today?
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-innovation-surface">
            Kori is your innovation co-pilot, inspiring and learning with you
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-6xl w-full mx-auto place-items-center items-center justify-items-center"
        >
          {optionCards.map(card => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(79, 70, 229, 0.6)"
              }}
              className="bg-gradient-to-br from-indigo-800/40 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl overflow-hidden cursor-pointer group h-[180px]"
              onClick={() => { navigate(card.path); }}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-center mb-2">
                  {card.icon}
                </div>
                <h2 className="text-xl font-bold mb-1.5 text-white group-hover:text-blue-300 transition-colors text-center">
                  {card.title}
                </h2>
                <p className="text-blue-200/80 text-sm text-center">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;