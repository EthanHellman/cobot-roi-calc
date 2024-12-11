import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FinancingToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const FinancingToggle: React.FC<FinancingToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-white">
      <Switch
        id="financing-mode"
        checked={isEnabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="financing-mode">Include Financing (OPEX) Analysis</Label>
    </div>
  );
};

export default FinancingToggle;