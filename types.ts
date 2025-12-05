export enum Subject {
  LICITACOES = "Licitações e Contratos",
  EXECUCAO_FINANCEIRA = "Execução Financeira",
  ADMINISTRACAO_PUBLICA = "Administração Pública"
}

export enum Difficulty {
  EASY = "Fácil",
  MEDIUM = "Média",
  HARD = "Difícil"
}

export interface Question {
  id: number;
  subject: string;
  difficulty: Difficulty;
  statement: string; // The main text of the question
  options: string[]; // 5 options
  correctIndex: number; // 0-4
  explanation: string; // Detailed explanation
}

export interface QuizConfig {
  subjects: Subject[];
  questionCount: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  scoreBySubject: Record<string, { total: number; correct: number }>;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  timeElapsed: number; // in seconds
}