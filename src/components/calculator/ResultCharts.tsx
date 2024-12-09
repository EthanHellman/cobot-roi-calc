import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalculatorResults } from '@/types/calculator';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';

interface ResultChartsProps {
  results: CalculatorResults;
}

const ResultCharts: React.FC<ResultChartsProps> = ({ results }) => {
  const [prevResults, setPrevResults] = useState<CalculatorResults | null>(null);
  const [highlightChanges, setHighlightChanges] = useState<{ [key: string]: 'increase' | 'decrease' | null }>({});

  // Debounced update checker
  const checkForChanges = useCallback(
    debounce((newResults: CalculatorResults) => {
      if (!prevResults) {
        setPrevResults(newResults);
        return;
      }

      const changes = {
        profit: newResults.profit.opex.duringLease > prevResults.profit.opex.duringLease ? 'increase' : 'decrease',
        productivity: newResults.production.partsPerWeekCobot > prevResults.production.partsPerWeekCobot ? 'increase' : 'decrease',
        roi: newResults.roi.opex.threeYearReturn > prevResults.roi.opex.threeYearReturn ? 'increase' : 'decrease'
      };

      setHighlightChanges(changes);
      setPrevResults(newResults);

      // Clear highlights after a short delay
      setTimeout(() => setHighlightChanges({}), 1500);
    }, 500),
    [prevResults]
  );

  useEffect(() => {
    checkForChanges(results);
  }, [results, checkForChanges]);

  const getHighlightColor = (key: string) => {
    const change = highlightChanges[key];
    if (change === 'increase') return 'text-green-600';
    if (change === 'decrease') return 'text-red-600';
    return 'text-gray-900';
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics - Always visible, subtle highlights */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border transition-colors duration-300">
              <p className="text-sm text-gray-600">Break-even Point</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${getHighlightColor('roi')}`}>
                {Math.min(results.roi.opex.paybackPeriod, results.roi.capex.paybackPeriod).toFixed(1)} years
              </p>
            </div>
            <div className="p-4 rounded-lg border transition-colors duration-300">
              <p className="text-sm text-gray-600">Productivity Increase</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${getHighlightColor('productivity')}`}>
                {(((results.production.partsPerWeekCobot - results.production.partsPerWeekManual) / results.production.partsPerWeekManual) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg border transition-colors duration-300">
              <p className="text-sm text-gray-600">3-Year Return</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${getHighlightColor('roi')}`}>
                ${Math.max(results.roi.opex.threeYearReturn, results.roi.capex.threeYearReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts - No animation on continuous updates */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">5-Year Cumulative Return</h3>
          <div className="h-80">
            <LineChart
              width={800}
              height={300}
              data={results.visualizations.cashFlow}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="Manual" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="OPEX (Lease)" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="CAPEX" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Cost Comparison</h3>
            <BarChart
              width={400}
              height={300}
              data={results.visualizations.monthlyCosts}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Bar dataKey="cost" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Productivity Comparison</h3>
            <BarChart
              width={400}
              height={300}
              data={results.visualizations.productivity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Manual Welding" fill="#8884d8" />
              <Bar dataKey="Cobot" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultCharts;