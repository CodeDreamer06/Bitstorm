'use client';

import { useEffect } from 'react';
import { Filters } from '@/components/Filters';
import { DailyGoalTracker } from '@/components/DailyGoalTracker';
import { TimerPill } from '@/components/TimerPill';
import { QuestionCard } from '@/components/QuestionCard';
import { usePracticeStore } from '@/store/practiceStore';
import { Question } from '@/store/practiceStore';

export default function Home() {
  const loadQuestions = usePracticeStore(state => state.loadQuestions);
  const resetDailyCounterIfNeeded = usePracticeStore(state => state.resetDailyCounterIfNeeded);
  const filteredQuestions = usePracticeStore(state => state.filteredQuestions);
  const currentQuestionIndex = usePracticeStore(state => state.currentQuestionIndex);

  // Load questions from the JSON file
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json() as Question[];
        loadQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    }

    fetchQuestions();
    
    // Check if we need to reset the daily counter
    resetDailyCounterIfNeeded();
  }, [loadQuestions, resetDailyCounterIfNeeded]);

  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">BITSAT Practice</h1>
        
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="w-full md:w-auto">
            <Filters />
          </div>
          <div className="w-full md:w-64 space-y-4">
            <DailyGoalTracker />
          </div>
        </div>
      </div>

      {filteredQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <TimerPill className="w-auto" />
          </div>
          
          <QuestionCard />
          
          <div className="text-center text-sm text-muted-foreground">
            Question {filteredQuestions.length > 0 ? currentQuestionIndex + 1 : 0} of {filteredQuestions.length}
          </div>
        </div>
      )}
    </main>
  );
}
