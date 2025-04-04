'use client';

import { usePracticeStore } from '@/store/practiceStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import LatexRenderer from '@/components/LatexRenderer';

export function QuestionCard() {
  // Get the current question from the store
  const filteredQuestions = usePracticeStore(state => state.filteredQuestions);
  const currentQuestionIndex = usePracticeStore(state => state.currentQuestionIndex);
  const selectedOption = usePracticeStore(state => state.selectedOption);
  const showSolution = usePracticeStore(state => state.showSolution);
  const selectOption = usePracticeStore(state => state.selectOption);
  const toggleSolution = usePracticeStore(state => state.toggleSolution);
  const markCurrentQuestionAnswered = usePracticeStore(state => state.markCurrentQuestionAnswered);
  const nextQuestion = usePracticeStore(state => state.nextQuestion);
  const previousQuestion = usePracticeStore(state => state.previousQuestion);
  const resetStopwatch = usePracticeStore(state => state.resetStopwatch);

  // Get the current question
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // Reset stopwatch when the question changes
  useEffect(() => {
    resetStopwatch();
  }, [currentQuestionIndex, resetStopwatch]);
  
  // If no questions match filters
  if (!currentQuestion) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-medium mb-2">No questions match your filters</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find questions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    selectOption(optionIndex);
    markCurrentQuestionAnswered();
  };

  // Determine if an option is correct
  const isCorrectOption = (optionIndex: number) => {
    return selectedOption !== null && optionIndex === currentQuestion.correctOptionIndex;
  };

  // Determine if an option is incorrect
  const isIncorrectOption = (optionIndex: number) => {
    return selectedOption === optionIndex && optionIndex !== currentQuestion.correctOptionIndex;
  };

  // Get option style based on selected state and correctness
  const getOptionStyle = (optionIndex: number) => {
    if (selectedOption === null) return ""; // No selection yet
    
    if (isCorrectOption(optionIndex)) return "text-green-500 border-green-500";
    if (isIncorrectOption(optionIndex)) return "text-red-500 border-red-500";
    
    return "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl">
            <LatexRenderer content={currentQuestion.questionText} />
          </CardTitle>
          <div className="flex flex-col items-end text-sm">
            <div className="text-muted-foreground">{currentQuestion.subject}</div>
            <div className="text-muted-foreground">{currentQuestion.topic}</div>
            <div className="text-muted-foreground italic">{currentQuestion.source}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedOption?.toString() || ""} 
          onValueChange={(value: string) => handleOptionSelect(parseInt(value, 10))}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-2 rounded border ${getOptionStyle(index)}`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  <LatexRenderer content={option} />
                </Label>
                {isCorrectOption(index) && <Check className="h-4 w-4 text-green-500" />}
                {isIncorrectOption(index) && <X className="h-4 w-4 text-red-500" />}
              </div>
            ))}
          </div>
        </RadioGroup>

        {showSolution && currentQuestion.solution && (
          <div className="mt-6 p-4 border rounded-lg bg-slate-800">
            <h4 className="text-sm font-medium mb-2">Solution:</h4>
            <div className="text-sm">
              <LatexRenderer content={currentQuestion.solution} />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={previousQuestion}
            disabled={currentQuestionIndex <= 0}
          >
            Previous
          </Button>
        </div>
        <div className="flex gap-2">
          {currentQuestion.solution && (
            <Button 
              variant="outline" 
              onClick={toggleSolution}
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>
          )}
          <Button 
            onClick={nextQuestion}
            disabled={currentQuestionIndex >= filteredQuestions.length - 1}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 