import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import CollapsiblePartCard from './CollapsiblePartCard';
import { WeldJob, Part } from '@/types/weld-jobs';

interface CollapsibleJobEditorProps {
  job: WeldJob;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (job: WeldJob) => void;
  onDelete: () => void;
}

const CollapsibleJobEditor: React.FC<CollapsibleJobEditorProps> = ({
  job,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete
}) => {
  const handleAddPart = () => {
    const newPart: Part = {
      id: `part-${Date.now()}`,
      name: 'New Part',
      length: 6,
      passes: 1,
      manualTravelSpeed: 12,
      cobotTravelSpeed: 15,
      manualEfficiency: 70,
      cobotEfficiency: 90
    };

    onUpdate({
      ...job,
      parts: [...job.parts, { part: newPart, quantity: 1 }]
    });
  };

  const totalParts = job.parts.reduce((sum, { quantity }) => sum + quantity, 0);
  const annualParts = job.annualDemand;

  return (
    <Card className="mb-2">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <div>
            <span className="font-medium">{job.name}</span>
            <span className="text-sm text-gray-500 ml-2">
              ({job.parts.length} types, {totalParts} parts/job, {annualParts.toLocaleString()}/year)
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Name</Label>
                <Input
                  value={job.name}
                  onChange={(e) => onUpdate({ ...job, name: e.target.value })}
                  placeholder="Enter job name"
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Demand</Label>
                <Input
                  type="number"
                  value={job.annualDemand}
                  onChange={(e) => onUpdate({ 
                    ...job, 
                    annualDemand: parseInt(e.target.value) || 0 
                  })}
                  placeholder="Parts per year"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Parts</Label>
                <Button 
                  onClick={handleAddPart} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </div>

              <div className="space-y-2">
                {job.parts.map(({ part, quantity }, partIndex) => (
                  <CollapsiblePartCard
                    key={part.id}
                    part={part}
                    quantity={quantity}
                    onPartChange={(updatedPart) => {
                      const updatedParts = [...job.parts];
                      updatedParts[partIndex] = { 
                        ...updatedParts[partIndex],
                        part: updatedPart 
                      };
                      onUpdate({ ...job, parts: updatedParts });
                    }}
                    onQuantityChange={(newQuantity) => {
                      const updatedParts = [...job.parts];
                      updatedParts[partIndex] = {
                        ...updatedParts[partIndex],
                        quantity: newQuantity
                      };
                      onUpdate({ ...job, parts: updatedParts });
                    }}
                    onDelete={() => {
                      const updatedParts = job.parts.filter((_, i) => i !== partIndex);
                      onUpdate({ ...job, parts: updatedParts });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CollapsibleJobEditor;