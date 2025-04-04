'use client';

import { useMemo } from 'react';
import { usePracticeStore } from '@/store/practiceStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the subjects we want to include
const ALLOWED_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

export function Filters() {
  const allQuestions = usePracticeStore(state => state.allQuestions);
  const selectedFilters = usePracticeStore(state => state.selectedFilters);
  const setFilters = usePracticeStore(state => state.setFilters);
  const resetFilters = usePracticeStore(state => state.resetFilters);

  // Extract unique subjects, topics, and sources
  const { subjects, topicsBySubject, sources } = useMemo(() => {
    const subjects = new Set<string>();
    const topicsBySubject: Record<string, Set<string>> = {};
    const sources = new Set<string>();

    // Initialize topics sets for each allowed subject
    ALLOWED_SUBJECTS.forEach(subject => {
      topicsBySubject[subject] = new Set<string>();
    });

    allQuestions.forEach(q => {
      // Only add allowed subjects
      if (ALLOWED_SUBJECTS.includes(q.subject)) {
        subjects.add(q.subject);
        
        // Initialize the set for this subject if it doesn't exist
        if (!topicsBySubject[q.subject]) {
          topicsBySubject[q.subject] = new Set<string>();
        }
        
        // Add topic to the appropriate subject's set
        topicsBySubject[q.subject].add(q.topic);
        sources.add(q.source);
      }
    });

    // Convert sets to sorted arrays
    return {
      subjects: Array.from(subjects).sort(),
      topicsBySubject: Object.entries(topicsBySubject).reduce((acc, [subject, topicsSet]) => {
        acc[subject] = Array.from(topicsSet).sort();
        return acc;
      }, {} as Record<string, string[]>),
      sources: Array.from(sources).sort(),
    };
  }, [allQuestions]);

  // Get topics for the currently selected subject
  const currentTopics = useMemo(() => {
    if (!selectedFilters.subject) {
      // If no subject is selected, show no topics
      return [];
    }
    return topicsBySubject[selectedFilters.subject] || [];
  }, [selectedFilters.subject, topicsBySubject]);

  // Handle filter changes
  const handleSubjectChange = (value: string) => {
    setFilters({ 
      subject: value === 'all' ? null : value,
      // Clear topic when subject changes
      topic: null
    });
  };

  const handleTopicChange = (value: string) => {
    setFilters({ topic: value === 'all' ? null : value });
  };

  const handleSourceChange = (value: string) => {
    setFilters({ source: value === 'all' ? null : value });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Subject</label>
        <Select 
          value={selectedFilters.subject || 'all'} 
          onValueChange={handleSubjectChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Topic</label>
        <Select 
          value={selectedFilters.topic || 'all'} 
          onValueChange={handleTopicChange}
          disabled={!selectedFilters.subject}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {currentTopics.map(topic => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Source</label>
        <Select 
          value={selectedFilters.source || 'all'} 
          onValueChange={handleSourceChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={handleResetFilters}>
        Reset Filters
      </Button>
    </div>
  );
} 