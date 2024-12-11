import { WeldJob, JobEfficiencyMetrics, TimeBreakdown } from '@/types/weld-jobs';

const MINUTES_PER_HOUR = 60;

interface JobBreakdown {
    jobName: string;
    manualTime: number;         // minutes per job
    cobotTime: number;          // minutes per job
    laborSaved: number;         // hours per year
    cycleTimeReduction: number; // percentage
  }
  
export interface ShopEfficiencyMetrics {
    totalJobs: number;
    uniqueParts: number;
    totalAnnualParts: number;
    manual: {
      totalWeldTime: number;     // minutes per year
      totalCycleTime: number;    // minutes per year
    };
    cobot: {
      totalWeldTime: number;     // minutes per year
      totalCycleTime: number;    // minutes per year
    };
    improvements: {
      totalLaborSaved: number;           // hours per year
      averageCycleTimeReduction: number; // percentage
      averageThroughputIncrease: number; // percentage
      jobBreakdown: JobBreakdown[];
    };
  }

function calculateSinglePartTime(
  length: number,
  passes: number,
  travelSpeed: number,
  efficiency: number,
  isManual: boolean
): number {
  if (travelSpeed <= 0) throw new Error('Travel speed must be greater than 0');
  if (efficiency <= 0) throw new Error('Efficiency must be greater than 0');

  const baseTime = (length * passes) / travelSpeed;
  return isManual ? baseTime / (efficiency / 100) : baseTime * (efficiency / 100);
}

export function calculateJobEfficiency(job: WeldJob): JobEfficiencyMetrics {
  const manual: TimeBreakdown = {
    weldTime: 0,
    totalCycleTime: 0
  };

  const cobot: TimeBreakdown = {
    weldTime: 0,
    totalCycleTime: 0
  };

  // Calculate total time for each part
  job.parts.forEach(({ part, quantity }) => {
    try {
      // Calculate time for one part
      const singlePartManualTime = calculateSinglePartTime(
        part.length,
        part.passes,
        part.manualTravelSpeed,
        part.manualEfficiency,
        true
      );
      
      const singlePartCobotTime = calculateSinglePartTime(
        part.length,
        part.passes,
        part.cobotTravelSpeed,
        part.cobotEfficiency,
        false
      );

      // Calculate total annual time for this part type
      const totalPartsPerYear = quantity * job.annualDemand;
      manual.weldTime += singlePartManualTime * totalPartsPerYear;
      cobot.weldTime += singlePartCobotTime * totalPartsPerYear;
    } catch (error) {
      console.error(`Error calculating times for part ${part.name}:`, error);
      // Continue with next part instead of failing completely
    }
  });

  // Set total cycle times (currently just weld times, can be expanded)
  manual.totalCycleTime = manual.weldTime;
  cobot.totalCycleTime = cobot.weldTime;

  // Calculate improvements (with safety checks)
  const cycleTimeReduction = manual.totalCycleTime > 0 
    ? ((manual.totalCycleTime - cobot.totalCycleTime) / manual.totalCycleTime) * 100
    : 0;

  const laborTimeSaved = (manual.totalCycleTime - cobot.totalCycleTime) / MINUTES_PER_HOUR;
  const throughputIncrease = cobot.totalCycleTime > 0
    ? ((manual.totalCycleTime / cobot.totalCycleTime) - 1) * 100
    : 0;

  return {
    manual,
    cobot,
    improvements: {
      cycleTimeReduction: Math.max(0, cycleTimeReduction),
      laborTimeSaved: Math.max(0, laborTimeSaved),
      throughputIncrease: Math.max(0, throughputIncrease),
      totalAnnualSavings: Math.max(0, laborTimeSaved)
    }
  };
}

export function calculateShopEfficiency(jobs: WeldJob[]): ShopEfficiencyMetrics {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return {
      totalJobs: 0,
      uniqueParts: 0,
      totalAnnualParts: 0,
      manual: { totalWeldTime: 0, totalCycleTime: 0 },
      cobot: { totalWeldTime: 0, totalCycleTime: 0 },
      improvements: {
        totalLaborSaved: 0,
        averageCycleTimeReduction: 0,
        averageThroughputIncrease: 0,
        jobBreakdown: []
      }
    };
  }

  // Calculate unique parts and total annual parts
  const uniqueParts = jobs.reduce((sum, job) => sum + job.parts.length, 0);
  const totalAnnualParts = jobs.reduce((sum, job) => 
    sum + job.parts.reduce((jobSum, { quantity }) => 
      jobSum + (quantity * job.annualDemand), 0
    ), 0
  );

  // Calculate metrics for each job
  const jobMetrics = jobs.map(job => ({
    job,
    metrics: calculateJobEfficiency(job)
  }));

  // Calculate shop-wide metrics
  const manualTimes = jobMetrics.reduce((total, { metrics }) => ({
    totalWeldTime: total.totalWeldTime + metrics.manual.weldTime,
    totalCycleTime: total.totalCycleTime + metrics.manual.totalCycleTime
  }), { totalWeldTime: 0, totalCycleTime: 0 });

  const cobotTimes = jobMetrics.reduce((total, { metrics }) => ({
    totalWeldTime: total.totalWeldTime + metrics.cobot.weldTime,
    totalCycleTime: total.totalCycleTime + metrics.cobot.totalCycleTime
  }), { totalWeldTime: 0, totalCycleTime: 0 });

  const totalLaborSaved = (manualTimes.totalCycleTime - cobotTimes.totalCycleTime) / MINUTES_PER_HOUR;

  // Calculate averages (only if there are jobs)
  const averageCycleTimeReduction = jobMetrics.reduce((sum, { metrics }) => 
    sum + metrics.improvements.cycleTimeReduction, 0) / jobs.length;

  const averageThroughputIncrease = jobMetrics.reduce((sum, { metrics }) => 
    sum + metrics.improvements.throughputIncrease, 0) / jobs.length;

    return {
        totalJobs: jobs.length,
        uniqueParts,
        totalAnnualParts,
        manual: manualTimes,
        cobot: cobotTimes,
        improvements: {
          totalLaborSaved: Math.max(0, totalLaborSaved),
          averageCycleTimeReduction: Math.max(0, averageCycleTimeReduction),
          averageThroughputIncrease: Math.max(0, averageThroughputIncrease),
          jobBreakdown: jobMetrics.map(({ job, metrics }) => ({
            jobName: job.name,
            manualTime: metrics.manual.totalCycleTime,
            cobotTime: metrics.cobot.totalCycleTime,
            laborSaved: metrics.improvements.laborTimeSaved,
            cycleTimeReduction: metrics.improvements.cycleTimeReduction
          }))
        }
      };
}