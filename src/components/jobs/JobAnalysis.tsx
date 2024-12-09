import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShopEfficiencyMetrics } from '@/utils/job-calculations';

interface JobAnalysisProps {
  shopMetrics: ShopEfficiencyMetrics;
}

const JobAnalysis: React.FC<JobAnalysisProps> = ({ shopMetrics }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const jobSavingsData = shopMetrics.improvements.jobBreakdown.map(job => ({
    name: job.jobName,
    'Labor Saved': Math.round(job.laborSaved),
    'Cycle Time Reduction': Math.round(job.cycleTimeReduction)
  }));

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'Labor Saved') return `${value} hours`;
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Labor Savings</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(shopMetrics.improvements.totalLaborSaved)} hrs/year
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Avg. Cycle Time Reduction</p>
            <p className="text-2xl font-bold text-green-600">
              {shopMetrics.improvements.averageCycleTimeReduction.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Avg. Throughput Increase</p>
            <p className="text-2xl font-bold text-purple-600">
              {shopMetrics.improvements.averageThroughputIncrease.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Number of Jobs: {shopMetrics.totalJobs}</p>
              <p className="text-sm text-gray-600">Unique Parts: {shopMetrics.uniqueParts}</p>
              <p className="text-sm text-gray-600">Total Annual Parts: {shopMetrics.totalAnnualParts.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Manual Weld Time: {formatTime(shopMetrics.manual.totalWeldTime)}/year</p>
              <p className="text-sm text-gray-600">Cobot Weld Time: {formatTime(shopMetrics.cobot.totalWeldTime)}/year</p>
              <p className="text-sm text-gray-600">Time Saved: {formatTime(shopMetrics.manual.totalWeldTime - shopMetrics.cobot.totalWeldTime)}/year</p>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={jobSavingsData}
                margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  label={{ 
                    value: 'Hours Saved per Year', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -40
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ 
                    value: 'Cycle Time Reduction %', 
                    angle: 90, 
                    position: 'insideRight',
                    offset: -30
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '12px'
                  }} 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="Labor Saved" 
                  fill="#6366f1" 
                  name="Labor Hours Saved/Year"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="Cycle Time Reduction" 
                  fill="#22c55e" 
                  name="Cycle Time Reduction %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobAnalysis;