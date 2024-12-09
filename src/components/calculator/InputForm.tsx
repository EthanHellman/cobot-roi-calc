import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorInputs } from '@/types/calculator';

interface InputFormProps {
  inputs: CalculatorInputs;
  onInputChange: (newInputs: CalculatorInputs) => void;
}

const InputForm: React.FC<InputFormProps> = ({ inputs, onInputChange }) => {
  const handleChange = (section: keyof CalculatorInputs, field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    if (section === 'welderSalary') {
      onInputChange({ ...inputs, [section]: numericValue });
    } else {
      onInputChange({
        ...inputs,
        [section]: {
          ...inputs[section],
          [field]: numericValue
        }
      });
    }
  };

  const getValue = (value: number): string => value.toString();

  return (
    <div className="space-y-4">
      {/* Shop Settings */}
      <div className="p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium mb-2">Shop Settings</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="hoursPerWeek" className="text-xs">Hours/Week</Label>
            <Input
              id="hoursPerWeek"
              type="number"
              value={getValue(inputs.shop.hoursPerWeek)}
              onChange={(e) => handleChange('shop', 'hoursPerWeek', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="numWelders" className="text-xs">Number of Welders</Label>
            <Input
              id="numWelders"
              type="number"
              value={getValue(inputs.shop.numWelders)}
              onChange={(e) => handleChange('shop', 'numWelders', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="welderOnTimePercent" className="text-xs">Welder On-Time %</Label>
            <Input
              id="welderOnTimePercent"
              type="number"
              value={getValue(inputs.shop.welderOnTimePercent)}
              onChange={(e) => handleChange('shop', 'welderOnTimePercent', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cobotWeldTimePercent" className="text-xs">Cobot On-Time %</Label>
            <Input
              id="cobotWeldTimePercent"
              type="number"
              value={getValue(inputs.shop.cobotWeldTimePercent)}
              onChange={(e) => handleChange('shop', 'cobotWeldTimePercent', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manualWeldTime" className="text-xs">Manual Weld Time (min)</Label>
            <Input
              id="manualWeldTime"
              type="number"
              value={getValue(inputs.shop.manualWeldTime)}
              onChange={(e) => handleChange('shop', 'manualWeldTime', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cobotWeldTime" className="text-xs">Cobot Weld Time (min)</Label>
            <Input
              id="cobotWeldTime"
              type="number"
              value={getValue(inputs.shop.cobotWeldTime)}
              onChange={(e) => handleChange('shop', 'cobotWeldTime', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Weld Parameters */}
      <div className="p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium mb-2">Weld Parameters</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="partsPerWeld" className="text-xs">Parts Per Weld</Label>
            <Input
              id="partsPerWeld"
              type="number"
              value={getValue(inputs.weld.partsPerWeld)}
              onChange={(e) => handleChange('weld', 'partsPerWeld', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weldPrice" className="text-xs">Price Per Weld ($)</Label>
            <Input
              id="weldPrice"
              type="number"
              value={getValue(inputs.weld.weldPrice)}
              onChange={(e) => handleChange('weld', 'weldPrice', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cobotDailyOpHours" className="text-xs">Cobot Hours/Day</Label>
            <Input
              id="cobotDailyOpHours"
              type="number"
              value={getValue(inputs.weld.cobotDailyOpHours)}
              onChange={(e) => handleChange('weld', 'cobotDailyOpHours', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="materialCostPerPart" className="text-xs">Material Cost/Part ($)</Label>
            <Input
              id="materialCostPerPart"
              type="number"
              value={getValue(inputs.weld.materialCostPerPart)}
              onChange={(e) => handleChange('weld', 'materialCostPerPart', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financing Options */}
      <div className="p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium mb-2">Financing Options</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="totalCobotCost" className="text-xs">Total Cobot Cost ($)</Label>
            <Input
              id="totalCobotCost"
              type="number"
              value={getValue(inputs.financing.totalCobotCost)}
              onChange={(e) => handleChange('financing', 'totalCobotCost', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="interestRate" className="text-xs">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={getValue(inputs.financing.interestRate * 100)}
              onChange={(e) => handleChange('financing', 'interestRate', (parseFloat(e.target.value) / 100).toString())}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="leaseLength" className="text-xs">Lease Length (months)</Label>
            <Input
              id="leaseLength"
              type="number"
              value={getValue(inputs.financing.leaseLength)}
              onChange={(e) => handleChange('financing', 'leaseLength', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="depreciationYears" className="text-xs">Depreciation Years</Label>
            <Input
              id="depreciationYears"
              type="number"
              value={getValue(inputs.financing.depreciationYears)}
              onChange={(e) => handleChange('financing', 'depreciationYears', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maintenancePercentage" className="text-xs">Maintenance % of Cost</Label>
            <Input
              id="maintenancePercentage"
              type="number"
              step="0.1"
              value={getValue(inputs.financing.maintenancePercentage * 100)}
              onChange={(e) => handleChange('financing', 'maintenancePercentage', (parseFloat(e.target.value) / 100).toString())}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Operating Costs */}
      <div className="p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium mb-2">Operating Costs</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="cobotPowerConsumption" className="text-xs">Power Consumption (W)</Label>
            <Input
              id="cobotPowerConsumption"
              type="number"
              value={getValue(inputs.operating.cobotPowerConsumption)}
              onChange={(e) => handleChange('operating', 'cobotPowerConsumption', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="electricityPrice" className="text-xs">Electricity Price ($/kWh)</Label>
            <Input
              id="electricityPrice"
              type="number"
              step="0.01"
              value={getValue(inputs.operating.electricityPrice)}
              onChange={(e) => handleChange('operating', 'electricityPrice', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cobotTechSalary" className="text-xs">Technician Salary ($)</Label>
            <Input
              id="cobotTechSalary"
              type="number"
              value={getValue(inputs.operating.cobotTechSalary)}
              onChange={(e) => handleChange('operating', 'cobotTechSalary', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="welderSalary" className="text-xs">Welder Salary ($)</Label>
            <Input
              id="welderSalary"
              type="number"
              value={getValue(inputs.welderSalary)}
              onChange={(e) => handleChange('welderSalary', '', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;