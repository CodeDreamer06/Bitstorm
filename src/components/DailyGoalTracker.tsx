'use client';

import { useState } from 'react';
import { usePracticeStore } from '@/store/practiceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export function DailyGoalTracker() {
  const dailyGoal = usePracticeStore(state => state.dailyGoal);
  const questionsDoneToday = usePracticeStore(state => state.questionsDoneToday);
  const setDailyGoal = usePracticeStore(state => state.setDailyGoal);
  
  const [newGoal, setNewGoal] = useState<string>(dailyGoal.toString());
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(
    Math.round((questionsDoneToday / dailyGoal) * 100), 
    100
  );

  const handleSaveGoal = () => {
    const goalValue = parseInt(newGoal, 10);
    if (!isNaN(goalValue) && goalValue > 0) {
      setDailyGoal(goalValue);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Daily Goal</h3>
        <div className="text-sm">
          <span className="font-bold text-green-400">{questionsDoneToday}</span>
          <span> / </span>
          <span>{dailyGoal}</span>
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      {isEditing ? (
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            min="1"
            value={newGoal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoal(e.target.value)}
            className="w-24"
          />
          <Button size="sm" onClick={handleSaveGoal}>
            Save
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => setIsEditing(true)}
        >
          Change Goal
        </Button>
      )}
    </div>
  );
} 