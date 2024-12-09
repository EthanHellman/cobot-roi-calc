export interface ShopConstants {
    hoursPerWeek: number;
    numWelders: number;
    welderOnTimePercent: number;
    cobotWeldTimePercent: number;
    manualWeldTime: number;  // minutes
    cobotWeldTime: number;   // minutes
  }
  
  export interface WeldConstants {
    partsPerWeld: number;
    weldPrice: number;
    cobotDailyOpHours: number;
    materialCostPerPart: number;
  }
  
  export interface FinancingOptions {
    totalCobotCost: number;
    interestRate: number;
    leaseLength: number;      // months
    depreciationYears: number;
    maintenancePercentage: number;
  }
  
  export interface OperatingCosts {
    cobotPowerConsumption: number;  // watts
    electricityPrice: number;       // per kWh
    cobotTechSalary: number;
  }
  
  export interface CalculatorInputs {
    shop: ShopConstants;
    weld: WeldConstants;
    financing: FinancingOptions;
    operating: OperatingCosts;
    welderSalary: number;
  }
  
  export interface CalculatorResults {
    production: {
      partsPerWeekManual: number;
      partsPerWeekCobot: number;
      moneyPerYearManual: number;
      moneyPerYearCobot: number;
    };
    costs: {
      opex: {
        monthlyLeaseCost: number;
        yearlyLeaseCost: number;
        operatingCostsPerYear: number;
      };
      capex: {
        yearlyDepreciation: number;
        yearlyMaintenance: number;
        operatingCostsPerYear: number;
      };
      manual: {
        yearlyLabor: number;
        yearlyMaterials: number;
      };
    };
    profit: {
      manual: number;
      opex: {
        duringLease: number;
        afterLease: number;
      };
      capex: number;
    };
    roi: {
      opex: {
        paybackPeriod: number;
        threeYearReturn: number;
      };
      capex: {
        paybackPeriod: number;
        threeYearReturn: number;
      };
    };
    visualizations: {
      cashFlow: Array<{
        year: string;
        Manual: number;
        'OPEX (Lease)': number;
        'CAPEX': number;
      }>;
      monthlyCosts: Array<{
        name: string;
        cost: number;
      }>;
      productivity: Array<{
        name: string;
        'Manual Welding': number;
        'Cobot': number;
      }>;
    };
  }