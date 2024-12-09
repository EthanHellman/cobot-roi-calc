import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeldJob } from '@/types/weld-jobs';
import { ShopEfficiencyMetrics } from '@/utils/job-calculations';

interface JobCalculationBreakdownProps {
  shopMetrics: ShopEfficiencyMetrics;
  jobs: WeldJob[];
}

const JobCalculationBreakdown: React.FC<JobCalculationBreakdownProps> = ({ shopMetrics, jobs }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const calculatePartTime = (
    length: number,
    passes: number,
    travelSpeed: number,
    efficiency: number,
    isManual: boolean
  ) => {
    const baseTime = (length * passes) / travelSpeed;
    return isManual ? baseTime / (efficiency / 100) : baseTime * (efficiency / 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop-wide Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-2">Volume Analysis</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Number of Jobs:</strong> {shopMetrics.totalJobs}</p>
                  <p><strong>Unique Parts:</strong> {shopMetrics.uniqueParts}</p>
                  <p><strong>Total Annual Parts:</strong> {shopMetrics.totalAnnualParts.toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Average Parts per Job:</strong> {(shopMetrics.uniqueParts / shopMetrics.totalJobs || 0).toFixed(1)}</p>
                  <p><strong>Average Annual Parts per Job:</strong> {(shopMetrics.totalAnnualParts / shopMetrics.totalJobs || 0).toFixed(0)}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Time Analysis</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Total Manual Weld Time:</strong> {formatTime(shopMetrics.manual.totalWeldTime)}/year</p>
                  <p><strong>Total Manual Cycle Time:</strong> {formatTime(shopMetrics.manual.totalCycleTime)}/year</p>
                </div>
                <div>
                  <p><strong>Total Cobot Weld Time:</strong> {formatTime(shopMetrics.cobot.totalWeldTime)}/year</p>
                  <p><strong>Total Cobot Cycle Time:</strong> {formatTime(shopMetrics.cobot.totalCycleTime)}/year</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Efficiency Improvements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Total Labor Saved:</strong> {Math.round(shopMetrics.improvements.totalLaborSaved)} hours/year</p>
                  <p><strong>Average Cycle Time Reduction:</strong> {formatPercent(shopMetrics.improvements.averageCycleTimeReduction)}</p>
                  <p><strong>Average Throughput Increase:</strong> {formatPercent(shopMetrics.improvements.averageThroughputIncrease)}</p>
                </div>
                <div>
                  <p><strong>Hours Saved per Job:</strong> {(shopMetrics.improvements.totalLaborSaved / shopMetrics.totalJobs || 0).toFixed(1)} hours/year</p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      {jobs.map(job => {
        const jobMetrics = shopMetrics.improvements.jobBreakdown.find(
          breakdown => breakdown.jobName === job.name
        );
        
        if (!jobMetrics) return null;

        return (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.name} Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Labor Saved:</strong> {Math.round(jobMetrics.laborSaved)} hours/year</p>
                    <p><strong>Contribution to Total Savings:</strong> {formatPercent((jobMetrics.laborSaved / shopMetrics.improvements.totalLaborSaved || 0) * 100)}</p>
                  </div>
                  <div>
                    <p><strong>Cycle Time Reduction:</strong> {formatPercent(jobMetrics.cycleTimeReduction)}</p>
                    <p><strong>vs. Shop Average:</strong> {formatPercent(jobMetrics.cycleTimeReduction - shopMetrics.improvements.averageCycleTimeReduction)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Part Details</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2">Part</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Manual Time</th>
                        <th className="pb-2">Cobot Time</th>
                        <th className="pb-2">Time Saved</th>
                        <th className="pb-2">Annual Hours Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.parts.map(({ part, quantity }) => {
                        const manualTime = calculatePartTime(
                          part.length,
                          part.passes,
                          part.manualTravelSpeed,
                          part.manualEfficiency,
                          true
                        );
                        const cobotTime = calculatePartTime(
                          part.length,
                          part.passes,
                          part.cobotTravelSpeed,
                          part.cobotEfficiency,
                          false
                        );
                        const timeSaved = manualTime - cobotTime;
                        const annualHoursSaved = (timeSaved * quantity * job.annualDemand) / 60;

                        return (
                          <tr key={part.id}>
                            <td>{part.name}</td>
                            <td>{quantity}</td>
                            <td>{manualTime.toFixed(2)} min</td>
                            <td>{cobotTime.toFixed(2)} min</td>
                            <td>{formatPercent((timeSaved / manualTime) * 100)}</td>
                            <td>{Math.round(annualHoursSaved)} hrs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default JobCalculationBreakdown;