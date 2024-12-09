import React from 'react';
import CollapsiblePartCard from './CollapsiblePartCard';
import { WeldJob } from '@/types/weld-jobs';

interface JobEditorProps {
  job: WeldJob;
  onSave: (job: WeldJob) => void;
  onCancel: () => void;
}

const JobEditor: React.FC<JobEditorProps> = ({ job, onSave }) => {
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
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
            onSave({ ...job, parts: updatedParts });
          }}
          onQuantityChange={(newQuantity) => {
            const updatedParts = [...job.parts];
            updatedParts[partIndex] = {
              ...updatedParts[partIndex],
              quantity: newQuantity
            };
            onSave({ ...job, parts: updatedParts });
          }}
          onDelete={() => {
            const updatedParts = job.parts.filter((_, i) => i !== partIndex);
            onSave({ ...job, parts: updatedParts });
          }}
        />
      ))}
      {job.parts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No parts added yet. Click "Add Part" to get started.
        </div>
      )}
    </div>
  );
};

export default JobEditor;