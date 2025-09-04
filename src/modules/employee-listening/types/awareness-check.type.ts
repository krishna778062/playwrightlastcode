export interface AwarenessQuestion {
  question: string;
  answers: string[];
  correctness: string[];
}

export interface AwarenessQuestionData {
  question: string;
  answers: string[];
  correctness: string[];
}

export interface AwarenessCheckOptions {
  stepInfo?: string;
  timeout?: number;
}
