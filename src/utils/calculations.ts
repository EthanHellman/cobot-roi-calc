import { CalculatorInputs, CalculatorResults } from '../types/calculator';

export function calculateMetrics(inputs: CalculatorInputs): CalculatorResults {
  const { shop, weld, financing, operating, welderSalary } = inputs;

  // Time calculations
  const manualWeldHoursPerWeek = shop.hoursPerWeek * (shop.welderOnTimePercent / 100);
  const cobotWeldHoursPerWeek = shop.hoursPerWeek * (shop.cobotWeldTimePercent / 100);
  const manualWeldTimePerPart = shop.manualWeldTime / 60;
  const cobotWeldTimePerPart = shop.cobotWeldTime / 60;
  const partsPerWeekManual = manualWeldHoursPerWeek / manualWeldTimePerPart;
  const partsPerWeekCobot = cobotWeldHoursPerWeek / cobotWeldTimePerPart;

  // Production calculations
  const moneyPerWeekManual = (partsPerWeekManual / weld.partsPerWeld) * weld.weldPrice;
  const moneyPerWeekCobot = (partsPerWeekCobot / weld.partsPerWeld) * weld.weldPrice;
  const moneyPerYearManual = moneyPerWeekManual * 52;
  const moneyPerYearCobot = moneyPerWeekCobot * 52;

  // Operating costs calculations
  const cobotPowerCostsPerHour = (operating.cobotPowerConsumption / 1000) * (1/60) * operating.electricityPrice;
  const cobotPowerCostsPerDay = cobotPowerCostsPerHour * weld.cobotDailyOpHours;
  const cobotPowerCostsPerYear = cobotPowerCostsPerDay * (365 * 5 / 7);
  const materialCostsCobotPerYear = partsPerWeekCobot * weld.materialCostPerPart * 52;
  const materialCostsManualPerYear = partsPerWeekManual * weld.materialCostPerPart * 52;

  // OPEX (Lease) calculations
  const totalLeaseAmount = financing.totalCobotCost * (1 + financing.interestRate);
  const monthlyLeaseCost = totalLeaseAmount / financing.leaseLength;
  const yearlyLeaseCost = monthlyLeaseCost * 12;

  // CAPEX calculations
  const yearlyDepreciation = financing.totalCobotCost / financing.depreciationYears;
  const yearlyMaintenance = financing.totalCobotCost * financing.maintenancePercentage;

  // Profit calculations
  const profitManualPerYear = moneyPerYearManual - welderSalary - materialCostsManualPerYear;
  const profitCobotLeasePerYear = moneyPerYearCobot - cobotPowerCostsPerYear - 
                               yearlyLeaseCost - operating.cobotTechSalary - materialCostsCobotPerYear;
  const profitCobotAfterLease = moneyPerYearCobot - cobotPowerCostsPerYear - 
                             operating.cobotTechSalary - materialCostsCobotPerYear;
  const profitCobotCapexPerYear = moneyPerYearCobot - cobotPowerCostsPerYear -
                               yearlyDepreciation - yearlyMaintenance -
                               operating.cobotTechSalary - materialCostsCobotPerYear;

  // Visualization data
  const cashFlowData = Array.from({length: 5}, (_, i) => {
    const year = i + 1;
    const manualCumulative = profitManualPerYear * year;
    const opexCumulative = year <= 3 ? 
      (profitCobotLeasePerYear * year) : 
      (profitCobotLeasePerYear * 3 + profitCobotAfterLease * (year - 3));
    const capexCumulative = profitCobotCapexPerYear * year;
    
    return {
      year: `Year ${year}`,
      Manual: manualCumulative,
      'OPEX (Lease)': opexCumulative - financing.totalCobotCost,
      'CAPEX': capexCumulative - financing.totalCobotCost,
    };
  });

  return {
    production: {
      partsPerWeekManual,
      partsPerWeekCobot,
      moneyPerYearManual,
      moneyPerYearCobot
    },
    costs: {
      opex: {
        monthlyLeaseCost,
        yearlyLeaseCost,
        operatingCostsPerYear: cobotPowerCostsPerYear + operating.cobotTechSalary + materialCostsCobotPerYear
      },
      capex: {
        yearlyDepreciation,
        yearlyMaintenance,
        operatingCostsPerYear: cobotPowerCostsPerYear + yearlyMaintenance + operating.cobotTechSalary + materialCostsCobotPerYear
      },
      manual: {
        yearlyLabor: welderSalary,
        yearlyMaterials: materialCostsManualPerYear
      }
    },
    profit: {
      manual: profitManualPerYear,
      opex: {
        duringLease: profitCobotLeasePerYear,
        afterLease: profitCobotAfterLease
      },
      capex: profitCobotCapexPerYear
    },
    roi: {
      opex: {
        paybackPeriod: financing.totalCobotCost / (profitCobotLeasePerYear - profitManualPerYear),
        threeYearReturn: (profitCobotLeasePerYear * 3) - (profitManualPerYear * 3)
      },
      capex: {
        paybackPeriod: financing.totalCobotCost / (profitCobotCapexPerYear - profitManualPerYear),
        threeYearReturn: (profitCobotCapexPerYear * 3) - (profitManualPerYear * 3)
      }
    },
    visualizations: {
      cashFlow: cashFlowData,
      monthlyCosts: [
        {
          name: 'Manual Welding',
          cost: (welderSalary + materialCostsManualPerYear) / 12
        },
        {
          name: 'OPEX (Lease)',
          cost: monthlyLeaseCost + (cobotPowerCostsPerYear + operating.cobotTechSalary + materialCostsCobotPerYear) / 12
        },
        {
          name: 'CAPEX',
          cost: (yearlyDepreciation + yearlyMaintenance + cobotPowerCostsPerYear + operating.cobotTechSalary + materialCostsCobotPerYear) / 12
        }
      ],
      productivity: [{
        name: 'Parts Per Week',
        'Manual Welding': partsPerWeekManual,
        'Cobot': partsPerWeekCobot
      }]
    }
  };
}