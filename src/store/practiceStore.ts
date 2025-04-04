import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the subjects we want to include (keep in sync with Filters.tsx)
const ALLOWED_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

// Define the Question type
export interface Question {
  id: string;
  subject: string;
  topic: string;
  source: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  solution: string;
}

// Interface for storing user's answer state for a question
interface QuestionState {
  selectedOption: number | null;
  showSolution: boolean;
  timeSpent?: number; // Optional future enhancement
}

// Define the filter state
interface Filters {
  subject: string | null;
  topic: string | null;
  source: string | null;
}

// Define the practice store state
interface PracticeState {
  // All questions loaded from questions.json
  allQuestions: Question[];
  // Questions filtered based on selected filters
  filteredQuestions: Question[];
  // Index of the current question in filteredQuestions
  currentQuestionIndex: number;
  // Filter settings
  selectedFilters: Filters;
  // Daily goal (number of questions per day)
  dailyGoal: number;
  // Number of questions completed today
  questionsDoneToday: number;
  // Timestamp of the last session (used to reset daily counter)
  lastSessionTimestamp: number;
  // Map to track answered questions (questionId -> boolean)
  answeredQuestions: Record<string, boolean>;
  // Map to store user's answer state for each question (questionId -> QuestionState)
  questionStates: Record<string, QuestionState>;
  // Selected option for the current question (derived from questionStates)
  selectedOption: number | null;
  // Whether to show solution for current question (derived from questionStates)
  showSolution: boolean;
  // Stopwatch start time for the current question
  stopwatchStartTime: number | null;

  // Actions
  loadQuestions: (questions: Question[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setDailyGoal: (goal: number) => void;
  markCurrentQuestionAnswered: () => void;
  resetDailyCounterIfNeeded: () => void;
  selectOption: (optionIndex: number) => void;
  toggleSolution: () => void;
  startStopwatch: () => void;
  resetStopwatch: () => void;
}

// Helper function to check if it's a new day
const isNewDay = (lastTimestamp: number): boolean => {
  const lastDate = new Date(lastTimestamp).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return lastDate < today;
};

// Helper function to apply filters to questions
const applyFilters = (questions: Question[], filters: Filters): Question[] => {
  return questions.filter(q => {
    if (filters.subject && q.subject !== filters.subject) return false;
    if (filters.topic && q.topic !== filters.topic) return false;
    if (filters.source && q.source !== filters.source) return false;
    return true;
  });
};

// Create the store with persistence
export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      // Initial state
      allQuestions: [],
      filteredQuestions: [],
      currentQuestionIndex: 0,
      selectedFilters: {
        subject: null,
        topic: null,
        source: null,
      },
      dailyGoal: 10, // Default goal of 10 questions per day
      questionsDoneToday: 0,
      lastSessionTimestamp: Date.now(),
      answeredQuestions: {},
      questionStates: {},
      selectedOption: null,
      showSolution: false,
      stopwatchStartTime: null,

      // Actions
      loadQuestions: (questions: Question[]) => {
        set((state) => {
          // Filter out questions from disallowed subjects
          const allowedQuestions = questions.filter(q => ALLOWED_SUBJECTS.includes(q.subject));
          const filteredQuestions = applyFilters(allowedQuestions, state.selectedFilters);
          
          // Initialize derived state from persisted questionStates
          let selectedOption = null;
          let showSolution = false;
          
          if (filteredQuestions.length > 0) {
            const currentQuestion = filteredQuestions[state.currentQuestionIndex];
            if (currentQuestion) {
              const questionState = state.questionStates[currentQuestion.id];
              if (questionState) {
                selectedOption = questionState.selectedOption;
                showSolution = questionState.showSolution;
              }
            }
          }
          
          return {
            allQuestions: allowedQuestions,
            filteredQuestions,
            selectedOption,
            showSolution,
          };
        });
        
        // Reset the daily counter if needed
        get().resetDailyCounterIfNeeded();
      },

      setFilters: (filters: Partial<Filters>) => {
        set((state) => {
          const newFilters = {
            ...state.selectedFilters,
            ...filters
          };
          
          const filteredQuestions = applyFilters(state.allQuestions, newFilters);
          
          // Reset derived state based on the new filtered questions and current index
          let selectedOption = null;
          let showSolution = false;
          
          if (filteredQuestions.length > 0) {
            // Always reset to the first question when filters change
            const currentQuestion = filteredQuestions[0];
            if (currentQuestion) {
              const questionState = state.questionStates[currentQuestion.id];
              if (questionState) {
                selectedOption = questionState.selectedOption;
                showSolution = questionState.showSolution;
              }
            }
          }
          
          return {
            selectedFilters: newFilters,
            filteredQuestions,
            currentQuestionIndex: 0, // Reset to first question when filters change
            selectedOption,
            showSolution,
          };
        });
      },

      resetFilters: () => {
        set((state) => {
          const newFilters = {
            subject: null,
            topic: null,
            source: null,
          };
          
          const filteredQuestions = state.allQuestions;
          
          // Reset derived state for the first question
          let selectedOption = null;
          let showSolution = false;
          
          if (filteredQuestions.length > 0) {
            const currentQuestion = filteredQuestions[0];
            if (currentQuestion) {
              const questionState = state.questionStates[currentQuestion.id];
              if (questionState) {
                selectedOption = questionState.selectedOption;
                showSolution = questionState.showSolution;
              }
            }
          }
          
          return {
            selectedFilters: newFilters,
            filteredQuestions,
            currentQuestionIndex: 0,
            selectedOption,
            showSolution,
          };
        });
      },

      nextQuestion: () => {
        set((state) => {
          if (state.currentQuestionIndex >= state.filteredQuestions.length - 1) {
            return state; // Don't go past the end
          }
          
          const nextIndex = state.currentQuestionIndex + 1;
          const nextQuestion = state.filteredQuestions[nextIndex];
          
          // Get the stored state for the next question, if it exists
          let selectedOption = null;
          let showSolution = false;
          
          if (nextQuestion) {
            const questionState = state.questionStates[nextQuestion.id];
            if (questionState) {
              selectedOption = questionState.selectedOption;
              showSolution = questionState.showSolution;
            }
          }
          
          return {
            currentQuestionIndex: nextIndex,
            selectedOption,
            showSolution,
            stopwatchStartTime: Date.now(), // Reset stopwatch for the new question
          };
        });
      },

      previousQuestion: () => {
        set((state) => {
          if (state.currentQuestionIndex <= 0) {
            return state; // Don't go before the start
          }
          
          const prevIndex = state.currentQuestionIndex - 1;
          const prevQuestion = state.filteredQuestions[prevIndex];
          
          // Get the stored state for the previous question, if it exists
          let selectedOption = null;
          let showSolution = false;
          
          if (prevQuestion) {
            const questionState = state.questionStates[prevQuestion.id];
            if (questionState) {
              selectedOption = questionState.selectedOption;
              showSolution = questionState.showSolution;
            }
          }
          
          return {
            currentQuestionIndex: prevIndex,
            selectedOption,
            showSolution,
            stopwatchStartTime: Date.now(), // Reset stopwatch for the new question
          };
        });
      },

      setDailyGoal: (goal: number) => {
        set({ dailyGoal: goal });
      },

      markCurrentQuestionAnswered: () => {
        set((state) => {
          const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];
          if (!currentQuestion) return state;

          const questionId = currentQuestion.id;
          const isAlreadyAnswered = state.answeredQuestions[questionId];

          // Only increment if this question hasn't been answered yet
          if (!isAlreadyAnswered) {
            return {
              questionsDoneToday: state.questionsDoneToday + 1,
              answeredQuestions: {
                ...state.answeredQuestions,
                [questionId]: true
              },
              lastSessionTimestamp: Date.now(),
            };
          }

          return state;
        });
      },

      resetDailyCounterIfNeeded: () => {
        set((state) => {
          if (isNewDay(state.lastSessionTimestamp)) {
            return {
              questionsDoneToday: 0,
              lastSessionTimestamp: Date.now()
            };
          }
          return state;
        });
      },

      selectOption: (optionIndex: number) => {
        set((state) => {
          const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];
          if (!currentQuestion) return state;
          
          // Update the question state in the map
          const questionStates = {
            ...state.questionStates,
            [currentQuestion.id]: {
              ...state.questionStates[currentQuestion.id],
              selectedOption: optionIndex,
              showSolution: true
            }
          };
          
          return { 
            selectedOption: optionIndex,
            showSolution: true,
            questionStates
          };
        });
      },

      toggleSolution: () => {
        set((state) => {
          const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];
          if (!currentQuestion) return state;
          
          const newShowSolution = !state.showSolution;
          
          // Update the question state in the map
          const questionStates = {
            ...state.questionStates,
            [currentQuestion.id]: {
              ...state.questionStates[currentQuestion.id],
              showSolution: newShowSolution
            }
          };
          
          return { 
            showSolution: newShowSolution,
            questionStates
          };
        });
      },

      startStopwatch: () => {
        set({ stopwatchStartTime: Date.now() });
      },

      resetStopwatch: () => {
        set({ stopwatchStartTime: Date.now() });
      },
    }),
    {
      name: 'bitsat-practice-storage',
      // Only persist what's needed across page refreshes
      partialize: (state) => ({
        currentQuestionIndex: state.currentQuestionIndex,
        selectedFilters: state.selectedFilters,
        dailyGoal: state.dailyGoal,
        questionsDoneToday: state.questionsDoneToday,
        lastSessionTimestamp: state.lastSessionTimestamp,
        answeredQuestions: state.answeredQuestions,
        questionStates: state.questionStates, // Persist the question states
      }),
    }
  )
); 