import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required. Add it to .env"
  );
}

const ai = new GoogleGenAI({ apiKey });

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/**
 * Handle a chat turn with Gemini using the contract text as context.
 */
export async function chatWithContract(
  contractText: string,
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const CHAT_SYSTEM_PROMPT = `You are a contract assistant for SimpleTerms. The user will ask you questions about the legal contract text provided below.

Guidelines:
1. Answer the user's questions in great detail based ONLY on the provided contract text.
2. If you are not sure or if the answer is not directly stated in the contract, clearly state that you do not know or that it is not mentioned in the contract, instead of making things up or speculating. Do not invent details.
3. Always include a short disclaimer in your response stating that your answer is for informational purposes only and is not legal advice.
4. Keep your tone professional, clear, and helpful.

Here is the contract text:
---
${contractText}
---`;

  // Format the history for the model call.
  // We'll append the system instructions and contract text as system context.
  const contents = [
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    {
      role: "user" as const,
      parts: [{ text: newMessage }]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: CHAT_SYSTEM_PROMPT
    }
  });

  const output = response.text;
  if (!output) {
    throw new Error("No response generated from AI model.");
  }

  return output;
}
