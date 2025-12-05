import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateQuiz } from './services/geminiService';
import { Question, QuizConfig, QuizResult } from './types';
import { ScrollText } from 'lucide-react';

enum AppState {
  SETUP,
  LOADING,
  QUIZ,
  RESULTS
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleStartQuiz = async (config: QuizConfig) => {
    setAppState(AppState.LOADING);
    try {
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o simulado. Por favor, verifique a chave da API e tente novamente.");
      setAppState(AppState.SETUP);
    }
  };

  const handleFinishQuiz = (answers: Record<number, number>, timeElapsed: number) => {
    let correctCount = 0;
    const scoreBySubject: Record<string, { total: number; correct: number }> = {};

    questions.forEach(q => {
      // Init subject stats if needed
      if (!scoreBySubject[q.subject]) {
        scoreBySubject[q.subject] = { total: 0, correct: 0 };
      }
      
      scoreBySubject[q.subject].total += 1;

      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
        scoreBySubject[q.subject].correct += 1;
      }
    });

    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      scoreBySubject,
      answers,
      timeElapsed
    };

    setQuizResult(result);
    setAppState(AppState.RESULTS);
  };

  const handleRestart = () => {
    setQuestions([]);
    setQuizResult(null);
    setAppState(AppState.SETUP);
  };

  const handleRetryWrong = () => {
    if (!quizResult) return;
    
    const wrongQuestions = questions.filter(q => {
      const userAnswer = quizResult.answers[q.id];
      return userAnswer !== q.correctIndex;
    });

    if (wrongQuestions.length === 0) return;

    // Reset for the retry session
    setQuestions(wrongQuestions);
    setQuizResult(null);
    setAppState(AppState.QUIZ);
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-100 selection:bg-slate-300">
      {/* Header only shown in Setup and Result for cleaner Quiz UI */}
      {appState !== AppState.QUIZ && (
        <header className="bg-slate-900 border-b-4 border-slate-950 py-5 px-6 mb-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg border-b-4 border-blue-800 shadow-sm">
                <ScrollText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">Simulado Pro</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Foco Total: Cebraspe</p>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 hidden sm:block">
               v1.1.0
            </div>
          </div>
        </header>
      )}

      <main className={appState === AppState.QUIZ ? "h-screen" : "container mx-auto px-4 pb-12"}>
        {appState === AppState.SETUP && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <SetupScreen onStart={handleStartQuiz} isLoading={false} />
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <SetupScreen onStart={() => {}} isLoading={true} />
          </div>
        )}

        {appState === AppState.QUIZ && (
          <QuizScreen 
            questions={questions} 
            onFinish={handleFinishQuiz} 
          />
        )}

        {appState === AppState.RESULTS && quizResult && (
          <ResultsScreen 
            questions={questions} 
            result={quizResult} 
            onRestart={handleRestart}
            onRetryWrong={handleRetryWrong}
          />
        )}
      </main>
    </div>
  );
};

export default App;