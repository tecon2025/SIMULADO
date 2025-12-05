import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Question, Subject, QuizConfig } from "../types";

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          subject: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Fácil", "Média", "Difícil"] },
          statement: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 5 options (A, B, C, D, E)."
          },
          correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-4)" },
          explanation: { type: Type.STRING, description: "Detailed explanation quoting laws/articles." }
        },
        required: ["id", "subject", "difficulty", "statement", "options", "correctIndex", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  
  // Initialize AI client per request to ensure fresh API key usage if needed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = "gemini-2.5-flash";
  const subjectsStr = config.subjects.join(", ");
  
  const systemInstruction = `
    Você é um examinador sênior da banca Cebraspe (CESPE), especialista em concursos para Analista Fazendário.
    Sua tarefa é criar um simulado inédito, desafiador e tecnicamente preciso.
    
    Tópicos:
    1. Licitações e Contratos (Lei 14.133/2021, Lei 8.987/1995, etc.)
    2. Execução Financeira (Gestão de despesas, receitas, LRF, etc.)
    3. Administração Pública (Burocracia, LAI, Governabilidade, BSC, SWOT, etc.)
    
    Regras de Estilo Cebraspe:
    - Enunciados longos, contextualizados e complexos.
    - Linguagem técnico-jurídica formal.
    - Pegadinhas conceituais e inversões sutis.
    - Formato: Múltipla Escolha (5 alternativas: A, B, C, D, E), apenas UMA correta.
    - Distribuição de dificuldade: 40% Fácil, 40% Média, 20% Difícil.
    
    A saída deve ser estritamente um JSON conforme o schema fornecido.
  `;

  const prompt = `
    Gere ${config.questionCount} questões de múltipla escolha para um simulado de Analista Fazendário.
    As disciplinas selecionadas são: ${subjectsStr}.
    Distribua as questões equitativamente entre as disciplinas selecionadas.
    Garanta que as explicações ("explanation") sejam detalhadas, citando artigos de lei quando aplicável.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7, // Balance between creativity and precision
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    const parsed = JSON.parse(jsonText);
    
    // Validate and sanitize ID assignment
    return parsed.questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1 // Ensure sequential IDs
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao gerar o simulado. Tente novamente ou verifique sua chave de API.");
  }
};