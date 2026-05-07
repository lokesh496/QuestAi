export interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
}

export interface CodingQuestion {
  id: string;
  topic: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  leetcodeNumber?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendedFor: string;
  solutions: {
    c: string;
    cpp: string;
    java: string;
    python: string;
  };
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  recommendedFor: string;
}

export interface Generation {
  id: string;
  timestamp: string;
  topic: string;
  type: QuizType;
  questions: (CodingQuestion | MCQQuestion)[];
}

export type AppState = 'idle' | 'generating' | 'results';
export type QuizType = 'coding' | 'mcq';
