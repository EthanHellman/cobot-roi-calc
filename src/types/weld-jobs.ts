export interface Part {
    id: string;
    name: string;
    length: number;          // inches
    passes: number;          // number of passes required
    manualTravelSpeed: number;  // inches per minute
    cobotTravelSpeed: number;   // inches per minute
    manualEfficiency: number;   // percentage (0-100)
    cobotEfficiency: number;    // percentage (0-100)
}

export interface WeldJob {
    id: string;
    name: string;
    annualDemand: number;   // parts per year
    parts: Array<{
        part: Part;
        quantity: number;
    }>;
}
  
  export interface TimeBreakdown {
    weldTime: number;        // minutes
    totalCycleTime: number;  // minutes
  }
  
  export interface JobEfficiencyMetrics {
    manual: TimeBreakdown;
    cobot: TimeBreakdown;
    improvements: {
      cycleTimeReduction: number;    // percentage
      laborTimeSaved: number;        // hours per year
      throughputIncrease: number;    // percentage
      totalAnnualSavings: number;    // hours per year
    };
  }
  
  // Additional type guards or utility types could be added here if needed
  export type JobID = string;
  export type PartID = string;