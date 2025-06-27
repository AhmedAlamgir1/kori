
export const getCardStyling = (deckType?: string) => {
  const gradientClasses = {
    background: getGradient(deckType),
    text: getTextAccent(deckType)
  };
  
  return gradientClasses;
};

// Get background gradient based on card type or accent color
export const getGradient = (deckType?: string): string => {
  if (deckType) {
    switch(deckType) {
      case "scamper":
        return "from-purple-900/80 to-indigo-900/80";
      case "whatif":
        return "from-slate-800/80 to-blue-900/80";
      case "kaizen":
        return "from-slate-800/80 to-amber-900/80";
      default:
        return "from-slate-800/80 to-indigo-900/80";
    }
  }
  
  return "from-slate-800/80 to-indigo-900/80";
};

// Get text accent color based on card type or accent color
export const getTextAccent = (deckType?: string): string => {
  if (deckType) {
    switch(deckType) {
      case "scamper":
        return "text-purple-400";
      case "whatif":
        return "text-blue-400";
      case "kaizen":
        return "text-amber-400";
      default:
        return "text-indigo-400";
    }
  }
  
  return "text-indigo-400";
};
