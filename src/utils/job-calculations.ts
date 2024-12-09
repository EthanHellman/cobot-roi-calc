import { WeldJob, JobEfficiencyMetrics, TimeBreakdown } from '@/types/weld-jobs';

const MINUTES_PER_HOUR = 60;
const WORKING_DAYS_PER_YEAR = 250;

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
    jobBreakdown: Array<{
      jobName: string;
      laborSaved: number;              // hours per year
      cycleTimeReduction: number;      // percentage
    }>;
  };
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

  // Calculate annual times for each part
  job.parts.forEach(({ part, quantity }) => {
    // Calculate base time for one part
    const singlePartManualBaseTime = (part.length * part.passes) / part.manualTravelSpeed;
    const singlePartCobotBaseTime = (part.length * part.passes) / part.cobotTravelSpeed;

    // Apply efficiency factors
    const singlePartManualTime = singlePartManualBaseTime / (part.manualEfficiency / 100);
    const singlePartCobotTime = singlePartCobotBaseTime * (part.cobotEfficiency / 100);

    // Calculate total annual time for this part (quantity * annual demand)
    const annualPartManualTime = singlePartManualTime * quantity * job.annualDemand;
    const annualPartCobotTime = singlePartCobotTime * quantity * job.annualDemand;

    // Add to total times
    manual.weldTime += annualPartManualTime;
    cobot.weldTime += annualPartCobotTime;
  });

  // Set total cycle times (for now, just using weld times)
  manual.totalCycleTime = manual.weldTime;
  cobot.totalCycleTime = cobot.weldTime;

  // Calculate improvements
  const cycleTimeReduction = ((manual.totalCycleTime - cobot.totalCycleTime) / manual.totalCycleTime) * 100;
  const laborTimeSaved = (manual.totalCycleTime - cobot.totalCycleTime) / MINUTES_PER_HOUR;
  const throughputIncrease = ((manual.totalCycleTime / cobot.totalCycleTime) - 1) * 100;

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
  if (jobs.length === 0) {
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
    sum + job.parts.reduce((jobSum, { part, quantity }) => 
      jobSum + (quantity * job.annualDemand), 0
    ), 0
  );

  // Calculate metrics for each job
  const jobMetrics = jobs.map(job => ({
    job,
    metrics: calculateJobEfficiency(job)
  }));

  // Sum up total times across all jobs
  const manualTimes = jobMetrics.reduce((total, { metrics }) => ({
    totalWeldTime: total.totalWeldTime + metrics.manual.weldTime,
    totalCycleTime: total.totalCycleTime + metrics.manual.totalCycleTime
  }), { totalWeldTime: 0, totalCycleTime: 0 });

  const cobotTimes = jobMetrics.reduce((total, { metrics }) => ({
    totalWeldTime: total.totalWeldTime + metrics.cobot.weldTime,
    totalCycleTime: total.totalCycleTime + metrics.cobot.totalCycleTime
  }), { totalWeldTime: 0, totalCycleTime: 0 });

  const totalLaborSaved = (manualTimes.totalCycleTime - cobotTimes.totalCycleTime) / MINUTES_PER_HOUR;

  return {
    totalJobs: jobs.length,
    uniqueParts,
    totalAnnualParts,
    manual: manualTimes,
    cobot: cobotTimes,
    improvements: {
      totalLaborSaved: Math.max(0, totalLaborSaved),
      averageCycleTimeReduction: jobMetrics.reduce((sum, { metrics }) => 
        sum + metrics.improvements.cycleTimeReduction, 0) / jobs.length,
      averageThroughputIncrease: jobMetrics.reduce((sum, { metrics }) => 
        sum + metrics.improvements.throughputIncrease, 0) / jobs.length,
      jobBreakdown: jobMetrics.map(({ job, metrics }) => ({
        jobName: job.name,
        laborSaved: metrics.improvements.laborTimeSaved,
        cycleTimeReduction: metrics.improvements.cycleTimeReduction
      }))
    }
  };
}