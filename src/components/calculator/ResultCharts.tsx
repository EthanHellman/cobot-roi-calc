import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalculatorResults } from '@/types/calculator';
import { debounce } from 'lodash';

interface ResultChartsProps {
  results: CalculatorResults;
  showFinancing: boolean;
}

interface HighlightChanges {
  [key: string]: 'increase' | 'decrease' | null;
}

const ResultCharts: React.FC<ResultChartsProps> = ({ results, showFinancing }) => {
  const [prevResults, setPrevResults] = useState<CalculatorResults | null>(null);
  const [highlightChanges, setHighlightChanges] = useState<HighlightChanges>({});

  useEffect(() => {
    const debouncedCheck = debounce((newResults: CalculatorResults) => {
      if (!prevResults) {
        setPrevResults(newResults);
        return;
      }

      const changes: HighlightChanges = {
        profit: newResults.profit.opex.duringLease > prevResults.profit.opex.duringLease ? 'increase' : 'decrease',
        productivity: newResults.production.partsPerWeekCobot > prevResults.production.partsPerWeekCobot ? 'increase' : 'decrease',
        roi: newResults.roi.opex.threeYearReturn > prevResults.roi.opex.threeYearReturn ? 'increase' : 'decrease'
      };

      setHighlightChanges(changes);
      setPrevResults(newResults);

      // Clear highlights after a short delay
      setTimeout(() => setHighlightChanges({}), 1500);
    }, 500);

    debouncedCheck(results);

    return () => {
      debouncedCheck.cancel();
    };
  }, [results, prevResults]);

  const getHighlightColor = (key: string) => {
    const change = highlightChanges[key];
    if (change === 'increase') return 'text-green-600';
    if (change === 'decrease') return 'text-red-600';
    return 'text-gray-900';
  };

  const formatCurrency = (value: number) => 
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Modify cash flow data based on financing toggle
  const getCashFlowData = () => {
    if (!showFinancing) {
      return results.visualizations.cashFlow.map(year => ({
        year: year.year,
        Manual: year.Manual,
        CAPEX: year['CAPEX']
      }));
    }
    return results.visualizations.cashFlow;
  };

  // Filter monthly costs based on financing toggle
  const getMonthlyCostsData = () => {
    if (!showFinancing) {
      return results.visualizations.monthlyCosts.filter(
        cost => cost.name === 'Manual Welding' || cost.name === 'CAPEX'
      );
    }
    return results.visualizations.monthlyCosts;
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border transition-colors duration-300">
            <p className="text-sm text-gray-600">Break-even Point</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${getHighlightColor('roi')}`}>
                {showFinancing 
                ? `${Math.round(Math.min(results.roi.opex.paybackPeriod, results.roi.capex.paybackPeriod) * 12)} months`
                : `${Math.round(results.roi.capex.paybackPeriod * 12)} months`
                }
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
                {showFinancing 
                  ? formatCurrency(Math.max(results.roi.opex.threeYearReturn, results.roi.capex.threeYearReturn))
                  : formatCurrency(results.roi.capex.threeYearReturn)
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Return Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">5-Year Cumulative Return</h3>
          <div className="h-80">
            <LineChart
              width={800}
              height={300}
              data={getCashFlowData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="Manual" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="CAPEX" stroke="#ffc658" strokeWidth={2} />
              {showFinancing && (
                <Line type="monotone" dataKey="OPEX (Lease)" stroke="#82ca9d" strokeWidth={2} />
              )}
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
              data={getMonthlyCostsData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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