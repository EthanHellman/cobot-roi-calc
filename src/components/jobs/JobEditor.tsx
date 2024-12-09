import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WeldJob } from '@/types/weld-jobs';
import CollapsiblePartCard from './CollapsiblePartCard';

interface JobEditorProps {
  job: WeldJob;
  onSave: (job: WeldJob) => void;
  onCancel: () => void;
}

const JobEditor: React.FC<JobEditorProps> = ({ job, onSave, onCancel }) => {
  const [editedJob, setEditedJob] = useState<WeldJob>(job);

  const handleAddPart = () => {
    const newPart = {
      id: `part-${Date.now()}`,
      name: 'New Part',
      quantity: 1,
      length: 6,
      passes: 1,
      manualTravelSpeed: 12,
      cobotTravelSpeed: 15,
      manualEfficiency: 70,  // typical manual efficiency
      cobotEfficiency: 90    // typical cobot efficiency
    };

    setEditedJob({
      ...editedJob,
      parts: [...editedJob.parts, { part: newPart, quantity: 1 }]
    });
  };

  return (
    <div className="space-y-4">
      {/* Job Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobName">Job Name</Label>
          <Input
            id="jobName"
            value={editedJob.name}
            onChange={(e) => setEditedJob({ ...editedJob, name: e.target.value })}
            placeholder="Enter job name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="annualDemand">Annual Demand</Label>
          <Input
            id="annualDemand"
            type="number"
            value={editedJob.annualDemand}
            onChange={(e) => setEditedJob({ 
              ...editedJob, 
              annualDemand: parseInt(e.target.value) || 0 
            })}
            placeholder="Parts per year"
          />
        </div>
      </div>

      {/* Parts Section */}
      <div className="space-y-4">
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

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {editedJob.parts.map(({ part }, partIndex) => (
            <CollapsiblePartCard
              key={part.id}
              part={part}
              onPartChange={(updatedPart) => {
                const updatedParts = [...editedJob.parts];
                updatedParts[partIndex] = { 
                  ...updatedParts[partIndex],
                  part: updatedPart 
                };
                setEditedJob({ ...editedJob, parts: updatedParts });
              }}
              onDelete={() => {
                const updatedParts = editedJob.parts.filter((_, i) => i !== partIndex);
                setEditedJob({ ...editedJob, parts: updatedParts });
              }}
            />
          ))}
        </div>

        {editedJob.parts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No parts added yet. Click "Add Part" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobEditor;