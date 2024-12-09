import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Part } from '@/types/weld-jobs';

interface CollapsiblePartCardProps {
  part: Part;
  quantity: number;  // Add this to receive quantity from parent
  onPartChange: (updatedPart: Part) => void;
  onQuantityChange: (quantity: number) => void;  // Add this for quantity updates
  onDelete: () => void;
}

const CollapsiblePartCard: React.FC<CollapsiblePartCardProps> = ({
  part,
  quantity,
  onPartChange,
  onQuantityChange,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-2">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <span className="font-medium">{part.name}</span>
          <span className="text-sm text-gray-500">
            ({part.length}" × {part.passes} passes, Qty: {quantity})
          </span>
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
          <div className="grid gap-4">
            {/* Part Name and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Name</Label>
                <Input
                  value={part.name}
                  onChange={(e) => onPartChange({ ...part, name: e.target.value })}
                  placeholder="Enter part name"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                  placeholder="Parts per job"
                />
              </div>
            </div>

            {/* Weld Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weld Length (inches)</Label>
                <Input
                  type="number"
                  value={part.length}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    length: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Passes</Label>
                <Input
                  type="number"
                  value={part.passes}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    passes: parseInt(e.target.value) || 1 
                  })}
                />
              </div>
            </div>

            {/* Manual Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manual Travel Speed (ipm)</Label>
                <Input
                  type="number"
                  value={part.manualTravelSpeed}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    manualTravelSpeed: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Manual Efficiency (%)</Label>
                <Input
                  type="number"
                  value={part.manualEfficiency}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    manualEfficiency: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>

            {/* Cobot Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cobot Travel Speed (ipm)</Label>
                <Input
                  type="number"
                  value={part.cobotTravelSpeed}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    cobotTravelSpeed: parseFloat(e.target.value) || 0 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cobot Efficiency (%)</Label>
                <Input
                  type="number"
                  value={part.cobotEfficiency}
                  onChange={(e) => onPartChange({ 
                    ...part, 
                    cobotEfficiency: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CollapsiblePartCard;