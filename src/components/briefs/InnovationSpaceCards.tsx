
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, GraduationCap, Building2, Leaf, Users, Brain, Globe, HeartPulse, School, Lightbulb, Activity, Home } from "lucide-react";
import { getInnovationSpaces } from "@/utils/api/briefsApi";
import { InnovationSpace } from "@/types/briefs";
import LoadingAnimation from "@/components/LoadingAnimation";

interface InnovationSpaceCardsProps {
  category: "featured" | "sdgs" | "emerging";
  onSelectSpace: (spaceName: string) => void;
}

const InnovationSpaceCards: React.FC<InnovationSpaceCardsProps> = ({ category, onSelectSpace }) => {
  const [spaces, setSpaces] = useState<InnovationSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const spacesData = await getInnovationSpaces(category);
        setSpaces(spacesData);
      } catch (err) {
        console.error("Error fetching innovation spaces:", err);
        setError("Failed to load innovation spaces. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaces();
  }, [category]);

  // Helper function to get icon for a space
  const getSpaceIcon = (spaceName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Healthcare": <HeartPulse className="h-10 w-10 text-red-300" />,
      "Education": <GraduationCap className="h-10 w-10 text-blue-300" />,
      "Sustainability": <Leaf className="h-10 w-10 text-green-300" />,
      "Mental Health": <Brain className="h-10 w-10 text-purple-300" />,
      "Inclusive Society": <Users className="h-10 w-10 text-yellow-300" />,
      "Personal Wellbeing": <Heart className="h-10 w-10 text-pink-300" />,
      "Ageing Society": <Home className="h-10 w-10 text-orange-300" />,
      "Smart Cities": <Building2 className="h-10 w-10 text-emerald-300" />,
      "AI Ethics": <Brain className="h-10 w-10 text-indigo-300" />,
      "Climate Action": <Leaf className="h-10 w-10 text-green-300" />,
      "Quality Education": <School className="h-10 w-10 text-blue-300" />,
      "Good Health": <Activity className="h-10 w-10 text-red-300" />,
      "Reduced Inequalities": <Users className="h-10 w-10 text-yellow-300" />,
      "Innovation": <Lightbulb className="h-10 w-10 text-amber-300" />,
      "Global Partnerships": <Globe className="h-10 w-10 text-sky-300" />
    };

    return iconMap[spaceName] || <Lightbulb className="h-10 w-10 text-blue-300" />;
  };

  // Animation variants for staggered card appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingAnimation />
        <p className="text-blue-200 mt-4">Loading innovation spaces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 p-6 rounded-xl text-center">
        <p className="text-red-200">{error}</p>
        <p className="text-red-300 mt-2">Try refreshing the page or check your connection.</p>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-blue-200">No innovation spaces found for this category.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {spaces.map(space => (
        <motion.div 
          key={space.id} 
          variants={itemVariants}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="h-full"
        >
          <Card 
            className="bg-gradient-to-br from-slate-800/80 to-indigo-900/40 border-indigo-500/30 backdrop-blur-sm h-full cursor-pointer transition-all hover:shadow-md hover:shadow-indigo-500/20 hover:border-indigo-400/50"
            onClick={() => onSelectSpace(space.name)}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-center mb-4">
                {getSpaceIcon(space.name)}
              </div>
              
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                {space.name}
              </h3>
              
              <p className="text-blue-200/90 text-center flex-grow mb-4">
                {space.shortDescription}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center mt-auto">
                {space.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default InnovationSpaceCards;
