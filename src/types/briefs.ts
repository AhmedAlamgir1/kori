
export interface InnovationSpace {
  id: string;
  name: string;
  shortDescription: string;
  tags: string[];
  category: "featured" | "sdgs" | "emerging";
}

export interface InnovationAngle {
  title: string;
  description: string;
}

export interface KeyStatistic {
  value: string;
  description: string;
}

export interface SpaceDetails {
  name: string;
  overview: string;
  societalImpact: string;
  whyNow: string;
  keyStatistics: KeyStatistic[];
  innovationAngles: InnovationAngle[];
}
