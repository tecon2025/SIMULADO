import React, { useState } from 'react';
import { Subject, QuizConfig } from '../types';
import { BookOpen, CheckSquare, PlayCircle, Scale, Building2, Wallet, ScrollText } from 'lucide-react';

interface SetupScreenProps {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const handleStart = () => {
    if (selectedSubjects.length === 0) return;
    onStart({ subjects: selectedSubjects, questionCount });
  };

  const getIcon = (s: Subject) => {
    switch(s) {
      case Subject.LICITACOES: return <Scale className="w-6 h-6" />;
      case Subject.EXECUCAO_FINANCEIRA: return <Wallet className="w-6 h-6" />;
      case Subject.ADMINISTRACAO_PUBLICA: return <Building2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-[6px] shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 p-8 border-b-2 border-slate-100 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 bg-blue-700 p-4 rounded-2xl shadow-lg shadow-blue-200 border-b-4 border-blue-900">
                    <ScrollText className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">SIMULADO BANCA CEBRASPE 2025</h1>
                <p className="text-slate-500 font-medium">Analista Fazendário</p>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="p-8 space-y-10">
          {/* Subjects */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-slate-800 text-white p-1.5 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
              Disciplinas
            </h2>
            <div className="grid gap-4">
              {Object.values(Subject).map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                return (
                  <button 
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    disabled={isLoading}
                    className={`
                      relative group w-full flex items-center p-4 rounded-xl border-2 transition-all duration-150 active:translate-y-1 active:border-b-2
                      ${isSelected 
                        ? 'bg-slate-800 border-slate-900 border-b-[5px] text-white' 
                        : 'bg-white border-slate-200 border-b-[5px] hover:border-slate-300 text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    <div className={`mr-4 ${isSelected ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
                       {getIcon(subject)}
                    </div>
                    <span className="flex-1 text-left font-bold text-lg">
                      {subject}
                    </span>
                    {isSelected && (
                        <div className="bg-green-500 text-white p-1 rounded-full">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedSubjects.length === 0 && (
              <p className="text-sm text-red-500 mt-3 font-bold flex items-center gap-1 animate-pulse">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                Selecione pelo menos uma disciplina.
              </p>
            )}
          </div>

          {/* Question Count */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-slate-800 text-white p-1.5 rounded-lg">
                 <CheckSquare className="w-4 h-4" />
              </div>
              Quantidade de Questões
            </h2>
            <div className="flex flex-wrap gap-3">
                {[10, 20, 30, 40, 50].map(count => (
                    <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        disabled={isLoading}
                        className={`
                            px-6 py-3 rounded-xl text-base font-bold transition-all duration-150 active:translate-y-1 border-2 border-b-4
                            ${questionCount === count
                            ? 'bg-slate-800 text-white border-slate-950 active:border-b-2'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 active:border-b-2'}
                        `}
                    >
                        {count}
                    </button>
                ))}
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleStart}
            disabled={selectedSubjects.length === 0 || isLoading}
            className={`
              w-full py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all duration-150
              border-b-[6px] active:border-b-0 active:translate-y-[6px]
              ${selectedSubjects.length === 0 || isLoading
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800 shadow-xl shadow-slate-200'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparando Prova...
              </>
            ) : (
              <>
                INICIAR SIMULADO
                <PlayCircle className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;