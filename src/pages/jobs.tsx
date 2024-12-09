'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InputForm from '@/components/calculator/InputForm';
import ResultCharts from '@/components/calculator/ResultCharts';
import JobAnalysis from '@/components/jobs/JobAnalysis';
import JobCalculationBreakdown from '@/components/jobs/JobCalculationBreakdown';
import CollapsibleJobEditor from '@/components/jobs/CollapsibleJobEditor';
import { CalculatorInputs } from '@/types/calculator';
import { WeldJob } from '@/types/weld-jobs';
import { calculateMetrics } from '@/utils/calculations';
import { calculateShopEfficiency } from '@/utils/job-calculations';
import { saveJobsToStorage, loadJobsFromStorage } from '@/utils/local-storage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'roi' | 'time'>('roi');
  
  // ROI Calculator state
  const [inputs, setInputs] = useState<CalculatorInputs>({
    shop: {
      hoursPerWeek: 40,
      numWelders: 1,
      welderOnTimePercent: 80,
      cobotWeldTimePercent: 90,
      manualWeldTime: 30,
      cobotWeldTime: 20,
    },
    weld: {
      partsPerWeld: 1,
      weldPrice: 100,
      cobotDailyOpHours: 8,
      materialCostPerPart: 10,
    },
    financing: {
      totalCobotCost: 100000,
      interestRate: 0.05,
      leaseLength: 36,
      depreciationYears: 5,
      maintenancePercentage: 0.03,
    },
    operating: {
      cobotPowerConsumption: 1000,
      electricityPrice: 0.12,
      cobotTechSalary: 50000,
    },
    welderSalary: 60000,
  });

  // Jobs state
  const [jobs, setJobs] = useState<WeldJob[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedJobs = loadJobsFromStorage();
    setJobs(storedJobs);
  }, []);

  useEffect(() => {
    saveJobsToStorage(jobs);
  }, [jobs]);

  if (!mounted) {
    return null;
  }

  const roiResults = calculateMetrics(inputs);
  const shopMetrics = calculateShopEfficiency(jobs);

  const handleAddJob = () => {
    const newJob: WeldJob = {
      id: `job-${Date.now()}`,
      name: 'New Job',
      annualDemand: 1000,
      parts: []
    };
    setJobs([...jobs, newJob]);
    setExpandedJobId(newJob.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cobot Analysis Tool</h1>
          <p className="mt-2 text-gray-600">
            Analyze ROI and efficiency improvements for implementing collaborative robots in welding operations.
          </p>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'roi' | 'time')} className="mb-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="roi" className="flex-1">ROI Analysis</TabsTrigger>
            <TabsTrigger value="time" className="flex-1">Time Analysis</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Section - 4 columns */}
          <div className="lg:col-span-4">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {mode === 'roi' ? 'ROI Parameters' : 'Welding Jobs'}
                  </CardTitle>
                  {mode === 'time' && (
                    <Button onClick={handleAddJob} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Job
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {mode === 'roi' ? (
                  <InputForm inputs={inputs} onInputChange={setInputs} />
                ) : (
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                    {jobs.map(job => (
                      <CollapsibleJobEditor
                        key={job.id}
                        job={job}
                        isExpanded={expandedJobId === job.id}
                        onToggle={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        onUpdate={(updatedJob) => {
                          const updatedJobs = jobs.map(j => 
                            j.id === updatedJob.id ? updatedJob : j
                          );
                          setJobs(updatedJobs);
                        }}
                        onDelete={() => {
                          setJobs(jobs.filter(j => j.id !== job.id));
                          if (expandedJobId === job.id) {
                            setExpandedJobId(null);
                          }
                        }}
                      />
                    ))}
                    {jobs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No jobs added yet. Click "Add Job" to get started.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Section - 8 columns */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="analysis" className="space-y-6">
              <TabsList>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="calculations">Calculation Details</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis">
                {mode === 'roi' ? (
                  <ResultCharts results={roiResults} />
                ) : (
                  <JobAnalysis shopMetrics={shopMetrics} individualJobs={jobs} />
                )}
              </TabsContent>

              <TabsContent value="calculations">
                {mode === 'roi' ? (
                    <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Calculation Methodology</h3>
                        
                        <div className="space-y-6">
                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">Production Calculations</h4>
                            <div className="space-y-2 text-sm">
                            <p><strong>Manual Weld Hours/Week:</strong> {inputs.shop.hoursPerWeek} × {(inputs.shop.welderOnTimePercent/100).toFixed(2)} = {roiResults.production.partsPerWeekManual.toFixed(1)} parts</p>
                            <p><strong>Cobot Weld Hours/Week:</strong> {inputs.shop.hoursPerWeek} × {(inputs.shop.cobotWeldTimePercent/100).toFixed(2)} = {roiResults.production.partsPerWeekCobot.toFixed(1)} parts</p>
                            <p><strong>Annual Revenue (Manual):</strong> ${roiResults.production.moneyPerYearManual.toFixed(2)}</p>
                            <p><strong>Annual Revenue (Cobot):</strong> ${roiResults.production.moneyPerYearCobot.toFixed(2)}</p>
                            </div>
                        </section>

                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">Operating Costs</h4>
                            <div className="space-y-2 text-sm">
                            <p><strong>Manual Labor:</strong> ${roiResults.costs.manual.yearlyLabor.toFixed(2)}/year</p>
                            <p><strong>Cobot Power:</strong> {inputs.operating.cobotPowerConsumption}W × {inputs.operating.electricityPrice}/kWh × {inputs.weld.cobotDailyOpHours}hrs/day = ${(roiResults.costs.opex.operatingCostsPerYear/12).toFixed(2)}/month</p>
                            <p><strong>Materials (Manual):</strong> ${roiResults.costs.manual.yearlyMaterials.toFixed(2)}/year</p>
                            <p><strong>Materials (Cobot):</strong> ${roiResults.costs.opex.operatingCostsPerYear.toFixed(2)}/year</p>
                            </div>
                        </section>

                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">Financial Analysis</h4>
                            <div className="space-y-2 text-sm">
                            <p><strong>OPEX Monthly Lease:</strong> ${roiResults.costs.opex.monthlyLeaseCost.toFixed(2)}</p>
                            <p><strong>CAPEX Depreciation:</strong> ${roiResults.costs.capex.yearlyDepreciation.toFixed(2)}/year</p>
                            <p><strong>Annual Profit (Manual):</strong> ${roiResults.profit.manual.toFixed(2)}</p>
                            <p><strong>Annual Profit (OPEX):</strong> ${roiResults.profit.opex.duringLease.toFixed(2)}</p>
                            <p><strong>Annual Profit (CAPEX):</strong> ${roiResults.profit.capex.toFixed(2)}</p>
                            </div>
                        </section>

                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">ROI Breakdown</h4>
                            <div className="space-y-2 text-sm">
                            <p><strong>OPEX Payback Period:</strong> ${inputs.financing.totalCobotCost.toFixed(2)} ÷ ${(roiResults.profit.opex.duringLease - roiResults.profit.manual).toFixed(2)} = {roiResults.roi.opex.paybackPeriod.toFixed(2)} years</p>
                            <p><strong>CAPEX Payback Period:</strong> ${inputs.financing.totalCobotCost.toFixed(2)} ÷ ${(roiResults.profit.capex - roiResults.profit.manual).toFixed(2)} = {roiResults.roi.capex.paybackPeriod.toFixed(2)} years</p>
                            <p><strong>3-Year Return (OPEX):</strong> ${roiResults.roi.opex.threeYearReturn.toFixed(2)}</p>
                            <p><strong>3-Year Return (CAPEX):</strong> ${roiResults.roi.capex.threeYearReturn.toFixed(2)}</p>
                            </div>
                        </section>
                        </div>
                    </CardContent>
                    </Card>
                ) : (
                    <JobCalculationBreakdown shopMetrics={shopMetrics} jobs={jobs} />
                )}
                </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}