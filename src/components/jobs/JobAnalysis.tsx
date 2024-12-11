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

  // Transform the data for the chart
  const jobComparisonData = shopMetrics.improvements.jobBreakdown.map((job) => ({
    name: job.jobName,
    'Manual Time': job.manualTime,  // We'll need to add these to the jobBreakdown interface
    'Cobot Time': job.cobotTime,    // We'll need to add these to the jobBreakdown interface
    laborSaved: job.laborSaved,
    cycleTimeReduction: job.cycleTimeReduction
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const manualTime = payload[0].value;
      const cobotTime = payload[1].value;
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-indigo-600">Manual Time:</span> {formatTime(manualTime)}</p>
            <p><span className="text-emerald-600">Cobot Time:</span> {formatTime(cobotTime)}</p>
            <p className="border-t pt-1 mt-2">
              <span className="text-blue-600">Labor Saved:</span> {Math.round(data.laborSaved)} hours/year
            </p>
            <p>
              <span className="text-blue-600">Cycle Time Reduction:</span> {data.cycleTimeReduction.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
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
          <CardTitle>Job Time Comparison</CardTitle>
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
                data={jobComparisonData}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  label={{ 
                    value: 'Time (minutes)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="Manual Time" 
                  fill="#6366f1" 
                  name="Manual Process"
                />
                <Bar 
                  dataKey="Cobot Time" 
                  fill="#22c55e" 
                  name="Cobot Process"
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