import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Clock, ChevronLeft, ChevronRight, Flag, Menu, X, ArrowRight } from 'lucide-react';

interface QuizScreenProps {
  questions: Question[];
  onFinish: (answers: Record<number, number>, timeElapsed: number) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const toggleFlag = () => {
    setFlagged(prev => 
      prev.includes(currentQuestion.id)
        ? prev.filter(id => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const navigate = (direction: 'next' | 'prev') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsSidebarOpen(false);
  };

  const progress = ((Object.keys(answers).length) / totalQuestions) * 100;

  return (
    <div className="flex h-screen bg-slate-100 flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20 border-b-4 border-slate-950">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 active:scale-95 transition-transform">
            <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg">Questão {currentQuestionIndex + 1}</span>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-blue-400" />
            {formatTime(seconds)}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 w-80 bg-white border-r-2 border-slate-200 transform transition-transform duration-300 z-30 flex flex-col shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-black text-slate-800 text-lg uppercase tracking-wide">Navegação</h2>
            <p className="text-xs text-slate-500 font-bold">Analista Fazendário</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              const isFlagged = flagged.includes(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(index)}
                  className={`
                    relative h-12 w-full rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-150
                    border-b-4 active:border-b-0 active:translate-y-1
                    ${isCurrent 
                        ? 'bg-slate-800 text-white border-slate-950 ring-2 ring-slate-400 ring-offset-2' 
                        : isAnswered 
                            ? 'bg-blue-600 text-white border-blue-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                  `}
                >
                  {index + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t-2 border-slate-200 bg-white space-y-4">
          <div className="hidden md:flex items-center justify-center gap-2 font-mono text-xl text-slate-800 font-bold bg-slate-100 py-3 rounded-xl border-b-4 border-slate-200">
            <Clock className="w-5 h-5 text-slate-500" />
            {formatTime(seconds)}
          </div>
          <button
            onClick={() => onFinish(answers, seconds)}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-green-700 transition-all border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
          >
            Finalizar Prova
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-100">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-200 border-b border-slate-300">
          <div 
            className="h-full bg-slate-800 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border-2 border-slate-200 border-b-[6px]">
            <div className="flex items-center gap-3 mb-6">
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                    {currentQuestion.subject}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wide ${
                    currentQuestion.difficulty === 'Fácil' ? 'bg-green-50 text-green-700 border-green-200' :
                    currentQuestion.difficulty === 'Média' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {currentQuestion.difficulty}
                </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-serif text-slate-900 leading-relaxed mb-8 border-b border-slate-100 pb-8">
              <span className="font-sans text-slate-300 font-black mr-3 text-3xl float-left -mt-1">#{currentQuestionIndex + 1}</span>
              {currentQuestion.statement}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D, E

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`
                      w-full text-left p-5 rounded-xl border-2 transition-all duration-150 group flex items-start gap-4
                      border-b-4 active:border-b-2 active:translate-y-[2px]
                      ${isSelected 
                        ? 'border-slate-800 bg-slate-800 text-white border-b-slate-950' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 border-b-slate-300'}
                    `}
                  >
                    <span className={`
                        flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-colors
                        ${isSelected ? 'bg-white text-slate-900 border-white' : 'bg-slate-100 text-slate-500 border-slate-200 group-hover:border-slate-300'}
                    `}>
                        {letter}
                    </span>
                    <span className={`text-lg leading-snug ${isSelected ? 'font-medium' : ''}`}>
                        {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-white border-t-2 border-slate-200 p-4 flex justify-between items-center md:px-10 z-10">
            <button
                onClick={() => navigate('prev')}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 border-2 border-slate-200 border-b-4 hover:bg-slate-50 disabled:opacity-50 disabled:border-b-2 disabled:translate-y-[2px] disabled:cursor-not-allowed font-bold transition-all active:border-b-2 active:translate-y-[2px]"
            >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden md:inline">Anterior</span>
            </button>

            <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-2 border-b-4 active:border-b-2 active:translate-y-[2px] ${
                    flagged.includes(currentQuestion.id)
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 border-b-yellow-500'
                    : 'bg-white text-slate-500 border-slate-200 border-b-slate-300 hover:bg-slate-50'
                }`}
            >
                <Flag className={`w-5 h-5 ${flagged.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                <span className="hidden md:inline">Revisar depois</span>
            </button>

            <button
                onClick={() => navigate('next')}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white border-2 border-slate-950 border-b-4 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all active:border-b-0 active:translate-y-1"
            >
                <span className="hidden md:inline">Próxima</span>
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default QuizScreen;