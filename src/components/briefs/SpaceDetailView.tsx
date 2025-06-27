
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSpaceDetails } from "@/utils/api/briefsApi";
import { SpaceDetails } from "@/types/briefs";
import LoadingAnimation from "@/components/LoadingAnimation";

interface SpaceDetailViewProps {
  spaceName: string;
  onBack: () => void;
}

const SpaceDetailView: React.FC<SpaceDetailViewProps> = ({ spaceName, onBack }) => {
  const [details, setDetails] = useState<SpaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detailsData = await getSpaceDetails(spaceName);
        setDetails(detailsData);
      } catch (err) {
        console.error(`Error fetching details for ${spaceName}:`, err);
        setError(`Failed to load details for ${spaceName}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [spaceName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingAnimation />
        <p className="text-blue-200 mt-4">Loading details for {spaceName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 p-6 rounded-xl">
        <p className="text-red-200">{error}</p>
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="mt-4 border-red-400/50 text-red-200 hover:bg-red-800/30"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to innovation spaces
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-10">
        <p className="text-blue-200">No details found for {spaceName}.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to innovation spaces
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="mr-4 border-indigo-400/50 text-indigo-200 hover:bg-indigo-800/30"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-white">
          {spaceName}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-500/30 col-span-1 lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-300">Overview</h3>
            <p className="text-blue-100 whitespace-pre-line">{details.overview}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-500/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-300">Key Statistics</h3>
            <div className="space-y-4">
              {details.keyStatistics.map((stat, index) => (
                <div key={index} className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-blue-200/80 text-sm">{stat.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="impact" className="w-full">
        <TabsList className="bg-slate-800/60 border border-indigo-500/30 mb-6">
          <TabsTrigger value="impact" className="text-sm data-[state=active]:bg-indigo-600">
            Societal Impact
          </TabsTrigger>
          <TabsTrigger value="why-now" className="text-sm data-[state=active]:bg-indigo-600">
            Why Now?
          </TabsTrigger>
          <TabsTrigger value="angles" className="text-sm data-[state=active]:bg-indigo-600">
            Innovation Angles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="impact" className="mt-0">
          <Card className="bg-gradient-to-br from-slate-800/60 to-indigo-900/30 border-indigo-500/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Societal Impact</h3>
              <p className="text-blue-100 whitespace-pre-line">{details.societalImpact}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why-now" className="mt-0">
          <Card className="bg-gradient-to-br from-slate-800/60 to-indigo-900/30 border-indigo-500/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Why Innovate Now?</h3>
              <p className="text-blue-100 whitespace-pre-line">{details.whyNow}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="angles" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.innovationAngles.map((angle, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/60 to-indigo-900/30 border-indigo-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-indigo-300">{angle.title}</h3>
                  <p className="text-blue-100">{angle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 bg-gradient-to-br from-slate-800/60 to-indigo-900/30 border-indigo-500/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-300">Ready to Innovate?</h3>
          <p className="text-blue-100 mb-4">
            Use this brief as inspiration to identify specific problems within {spaceName} and start your innovation journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700 flex-1"
              onClick={() => window.location.href = "/innovate"}
            >
              Generate Ideas
            </Button>
            <Button 
              variant="outline" 
              className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-800/30 flex-1"
              onClick={() => window.location.href = "/understand"}
            >
              Research First
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpaceDetailView;
