import { Type } from '@google/genai';
import { CodingQuestion, MCQQuestion } from '../types';

async function callGeminiProxy(prompt: string, config: any, model: string) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, config, model })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "AI Generation failed" }));
      throw new Error(data.error || "AI Generation failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    throw error;
  }
}

const codingSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          inputFormat: { type: Type.STRING },
          outputFormat: { type: Type.STRING },
          constraints: { type: Type.STRING },
          sampleInput: { type: Type.STRING },
          sampleOutput: { type: Type.STRING },
          leetcodeNumber: { type: Type.NUMBER },
          difficulty: { type: Type.STRING },
          recommendedFor: { type: Type.STRING, description: "Who this question is recommended for, e.g. B.Tech 1st Year, 2nd Year, or specific streams like Computer Science, Mechanics etc." },
          testCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                input: { type: Type.STRING },
                output: { type: Type.STRING },
                isHidden: { type: Type.BOOLEAN }
              },
              required: ["input", "output", "isHidden"]
            }
          },
          solutions: {
            type: Type.OBJECT,
            properties: {
              c: { type: Type.STRING },
              cpp: { type: Type.STRING },
              java: { type: Type.STRING },
              python: { type: Type.STRING }
            },
            required: ["c", "cpp", "java", "python"]
          }
        },
        required: ["id", "title", "description", "inputFormat", "outputFormat", "constraints", "sampleInput", "sampleOutput", "testCases", "solutions", "difficulty"]
      }
    }
  },
  required: ["questions"]
};

const mcqSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendedFor: { type: Type.STRING, description: "Who this question is recommended for, e.g. B.Tech 1st Year, 2nd Year, or specific streams like Computer Science, Mechanics etc." }
        },
        required: ["id", "question", "options", "correctAnswer", "explanation", "recommendedFor"]
      }
    }
  },
  required: ["questions"]
};

export async function generateCodingQuestions(
  topic: string, 
  count: number, 
  source: 'leetcode' | 'original' = 'original',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): Promise<CodingQuestion[]> {
  const prompt = source === 'leetcode' 
    ? `Generate ${count} coding challenge(s) based on the core logic of real LeetCode problems about "${topic}" with "${difficulty}" difficulty.
       CRITICAL: 
       1. Use a unique creative title and unique descriptive scenario (do NOT use the official LeetCode title or description).
       2. Keep the technical logic, input/output format, and constraints identical to the actual LeetCode problem.
       3. Include the actual LeetCode question number in the "leetcodeNumber" field.
       4. Include exactly 15 test cases per question (3 public, 12 hidden).
       5. Specify who it is recommended for (e.g. B.Tech 1st Year, CS stream).
       Provide optimal solutions in C, C++, Java, and Python.`
    : `Generate ${count} unique and diverse original coding challenge(s) about "${topic}" with "${difficulty}" difficulty. 
       Include exactly 15 test cases per question (3 public, 12 hidden).
       Specify who each question is recommended for (e.g. B.Tech 2nd Year, IT stream).
       Provide optimal, production-ready solutions in C, C++, Java, and Python.`;

  const data = await callGeminiProxy(prompt, {
    responseMimeType: "application/json",
    responseSchema: codingSchema
  }, "gemini-1.5-pro");

  return JSON.parse(data.text).questions;
}

export async function generateMCQs(topic: string, count: number): Promise<MCQQuestion[]> {
  const data = await callGeminiProxy(
    `Generate ${count} advanced MCQs about "${topic}". For each question, specify who it is recommended for (e.g. B.Tech 1st Year, CS stream).`,
    {
      responseMimeType: "application/json",
      responseSchema: mcqSchema
    },
    "gemini-1.5-flash"
  );

  return JSON.parse(data.text).questions;
}

