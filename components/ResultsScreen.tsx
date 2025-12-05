import React from 'react';
import { Question, QuizResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle, XCircle, Award, BookOpen, AlertCircle, RefreshCw, RotateCcw, Scale, ArrowRight } from 'lucide-react';

interface ResultsScreenProps {
  questions: Question[];
  result: QuizResult;
  onRestart: () => void;
  onRetryWrong: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ questions, result, onRestart, onRetryWrong }) => {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  const getFeedbackMessage = () => {
    if (percentage >= 80) return { text: "Excelente!", color: "text-green-600", msg: "Você está pronto para a prova." };
    if (percentage >= 60) return { text: "Bom Desempenho", color: "text-blue-600", msg: "Continue revisando os detalhes." };
    if (percentage >= 40) return { text: "Regular", color: "text-yellow-600", msg: "Foque nos fundamentos." };
    return { text: "Precisa Estudar Mais", color: "text-red-600", msg: "Revise a teoria com urgência." };
  };

  const feedback = getFeedbackMessage();

  const pieData = [
    { name: 'Acertos', value: result.correctAnswers, color: '#16a34a' },
    { name: 'Erros', value: result.totalQuestions - result.correctAnswers, color: '#dc2626' },
  ];

  const subjectData = Object.entries(result.scoreBySubject).map(([subject, stats]) => {
     const s = stats as { total: number; correct: number };
     return {
        subject: subject,
        score: Math.round((s.correct / s.total) * 100),
        correct: s.correct,
        total: s.total
     };
  });

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  const hasErrors = result.correctAnswers < result.totalQuestions;

  // Cálculo da Nota Cebraspe (Líquida)
  const answeredCount = Object.keys(result.answers).length;
  const wrongAnswers = answeredCount - result.correctAnswers;
  const blankAnswers = result.totalQuestions - answeredCount;
  const penaltyFactor = 0.25;
  const rawCebraspeScore = result.correctAnswers - (wrongAnswers * penaltyFactor);
  const cebraspeScore = rawCebraspeScore; 

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-[6px] shadow-sm overflow-hidden">
          <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-slate-950">
            <h1 className="text-2xl font-serif font-bold tracking-tight">Relatório de Desempenho</h1>
            <div className="flex gap-3">
                {hasErrors && (
                    <button 
                        onClick={onRetryWrong}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl transition-all font-bold border-b-4 border-orange-800 active:border-b-0 active:translate-y-1"
                    >
                        <RotateCcw className="w-4 h-4" /> Repetir Erros
                    </button>
                )}
                <button 
                    onClick={onRestart} 
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl transition-all font-bold border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
                >
                    <RefreshCw className="w-4 h-4" /> Novo Simulado
                </button>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-3 gap-8 items-center bg-white">
             {/* Score Big Display */}
            <div className="text-center md:border-r-2 border-slate-100">
                <div className="relative inline-flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                        <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={477} strokeDashoffset={477 - (477 * percentage) / 100} className={`${percentage >= 60 ? 'text-green-500' : 'text-red-500'} transition-all duration-1000 ease-out`} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-slate-800">{percentage}%</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Acertos</span>
                    </div>
                </div>
                <h2 className={`text-xl font-bold mt-4 ${feedback.color}`}>{feedback.text}</h2>
                <p className="text-slate-500 text-sm font-medium">{feedback.msg}</p>
            </div>

            {/* Chart */}
            <div className="h-52 md:border-r-2 border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                            itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-4">
                
                {/* Nota Cebraspe Card */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl border-2 border-indigo-100 relative">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-indigo-900">
                            <Scale className="w-5 h-5" />
                            <span className="font-bold">Nota Cebraspe</span>
                        </div>
                        <span className={`font-black text-3xl ${cebraspeScore < 0 ? 'text-red-600' : 'text-indigo-700'}`}>
                            {cebraspeScore.toFixed(2)}
                        </span>
                    </div>
                    
                    <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between text-green-700 bg-green-50/50 px-2 py-1 rounded">
                            <span>Acertos (+1.0)</span>
                            <span className="font-bold">{result.correctAnswers}</span>
                        </div>
                        <div className="flex justify-between text-red-600 bg-red-50/50 px-2 py-1 rounded">
                            <span>Erros (-{penaltyFactor})</span>
                            <span className="font-bold">{wrongAnswers}</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-center text-indigo-400 mt-3 border-t border-indigo-200 pt-2 font-bold uppercase tracking-wide">
                        Líquida (Múltipla Escolha)
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Tempo Total</span>
                    </div>
                    <span className="font-bold text-lg text-slate-900 font-mono">{formatTime(result.timeElapsed)}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Breakdown by Subject Graph */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-slate-200 border-b-[6px]">
            <h3 className="text-xl font-bold text-slate-800 mb-8 font-serif flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <Award className="w-5 h-5" />
                </div>
                Desempenho por Disciplina
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="subject" type="category" width={180} tick={{fontSize: 13, fill: '#334155', fontWeight: 700}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                            cursor={{fill: '#f1f5f9'}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-slate-800 p-3 shadow-xl rounded-xl text-sm text-white">
                                            <p className="font-bold mb-1">{d.subject}</p>
                                            <p className="text-blue-200 font-medium">Acertos: {d.correct}/{d.total} ({d.score}%)</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="score" fill="#334155" radius={[0, 6, 6, 0]} barSize={28} background={{ fill: '#f1f5f9', radius: [0, 6, 6, 0] }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Detailed Correction */}
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 border-b-2 border-slate-200 pb-4">Gabarito Comentado</h2>
            
            {questions.map((q, index) => {
                const userAnswer = result.answers[q.id];
                const isCorrect = userAnswer === q.correctIndex;
                const isSkipped = userAnswer === undefined;
                
                return (
                    <div key={q.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${isCorrect ? 'border-green-500' : isSkipped ? 'border-slate-300' : 'border-red-500'}`}>
                        <div className="p-6 md:p-8">
                            <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-sm">#{index + 1}</span>
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{q.subject}</span>
                                </div>
                                {isCorrect ? (
                                    <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-4 py-1.5 rounded-xl border border-green-100">
                                        <CheckCircle className="w-5 h-5" /> Correto
                                    </div>
                                ) : isSkipped ? (
                                    <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200">
                                        <AlertCircle className="w-5 h-5" /> Em branco
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-1.5 rounded-xl border border-red-100">
                                        <XCircle className="w-5 h-5" /> Errado
                                    </div>
                                )}
                            </div>

                            <p className="font-serif text-lg text-slate-800 mb-8 leading-relaxed font-medium">{q.statement}</p>

                            <div className="space-y-3 mb-8">
                                {q.options.map((opt, i) => {
                                    const isSelected = userAnswer === i;
                                    const isTarget = q.correctIndex === i;
                                    
                                    let styleClass = "border-slate-200 text-slate-600 bg-white"; // default
                                    if (isTarget) styleClass = "border-green-500 bg-green-50 text-green-900 font-bold shadow-sm";
                                    else if (isSelected && !isTarget) styleClass = "border-red-500 bg-red-50 text-red-900 font-medium";
                                    
                                    return (
                                        <div key={i} className={`p-4 rounded-xl border-2 flex gap-4 text-base transition-colors ${styleClass}`}>
                                            <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold border ${isTarget ? 'bg-green-600 text-white border-green-600' : 'bg-slate-100 border-slate-300'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span>{opt}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-slate-600">
                                <h4 className="flex items-center gap-2 text-slate-800 font-bold mb-3 uppercase text-sm tracking-wide">
                                    <BookOpen className="w-5 h-5" />
                                    Explicação
                                </h4>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                    {q.explanation}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;