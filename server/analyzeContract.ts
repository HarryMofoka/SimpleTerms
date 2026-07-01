import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required. Add it to .env"
  );
}

const ai = new GoogleGenAI({ apiKey });

/**
 * JSON Schema that enforces the AnalysisReport shape on Gemini's response.
 * This guarantees the frontend receives predictable, typed data.
 */
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    contractType: {
      type: Type.STRING,
      description:
        "The type of contract (e.g. Residential lease agreement, Employment contract)."
    },
    confidence: {
      type: Type.STRING,
      description:
        "A short sentence describing analysis confidence (e.g. High confidence based on clear legal language)."
    },
    summary: {
      type: Type.STRING,
      description:
        "A 2-3 sentence plain-English summary of what the contract means for the signer."
    },
    riskOverview: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          enum: ["low", "medium", "high", "critical"],
          description: "Overall risk level."
        },
        explanation: {
          type: Type.STRING,
          description: "Why this risk level was assigned."
        }
      },
      required: ["level", "explanation"] as const
    },
    obligations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Short obligation name." },
          detail: {
            type: Type.STRING,
            description: "Plain-English explanation of the obligation."
          }
        },
        required: ["label", "detail"] as const
      },
      description: "3-6 key obligations for the person signing."
    },
    keyDates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Date label." },
          value: {
            type: Type.STRING,
            description:
              "The date value or relative timeframe if no specific date is stated."
          }
        },
        required: ["label", "value"] as const
      },
      description: "2-5 important dates or deadlines."
    },
    clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description:
              "Short lowercase identifier (e.g. rent, termination, liability)."
          },
          title: { type: Type.STRING, description: "Clause title." },
          category: {
            type: Type.STRING,
            description: "Clause category (e.g. Payment, Renewal, Liability)."
          },
          riskLevel: {
            type: Type.STRING,
            enum: ["low", "medium", "high", "critical"],
            description: "Risk level of this specific clause."
          },
          plainEnglish: {
            type: Type.STRING,
            description: "What this clause means in plain English."
          },
          whyItMatters: {
            type: Type.STRING,
            description: "Why the signer should pay attention to this clause."
          }
        },
        required: [
          "id",
          "title",
          "category",
          "riskLevel",
          "plainEnglish",
          "whyItMatters"
        ] as const
      },
      description: "3-8 most important clauses."
    },
    checklist: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-6 actionable items to complete before signing."
    }
  },
  required: [
    "contractType",
    "confidence",
    "summary",
    "riskOverview",
    "obligations",
    "keyDates",
    "clauses",
    "checklist"
  ] as const
};

const SYSTEM_PROMPT = `You are a contract analysis assistant for SimpleTerms. Your job is to help ordinary people understand legal agreements in plain English.

Given the text of a legal contract, analyze it and produce a structured report with these sections:

1. **contractType**: Identify the type of contract (e.g. "Residential lease agreement", "Employment contract", "Service agreement").
2. **confidence**: Describe your confidence in the analysis (e.g. "High confidence based on clear legal language").
3. **summary**: Write a 2-3 sentence plain-English summary of what the contract is about and what it means for the person signing it.
4. **riskOverview**: Assess the overall risk level (low/medium/high/critical) and explain why.
5. **obligations**: List the key obligations for the person signing (3-6 items).
6. **keyDates**: Extract important dates or deadlines (2-5 items). If specific dates aren't mentioned, note the relative timeframes.
7. **clauses**: Identify the most important clauses (3-8 items), each with a unique id, title, category, risk level, plain-English explanation, and why it matters.
8. **checklist**: Provide 3-6 actionable items the person should do before signing.

Guidelines:
- Use simple, clear language that anyone can understand.
- Do NOT provide legal advice. Frame everything as explanation and understanding.
- Be honest about ambiguity — if something is unclear in the contract, say so.
- Focus on what matters most to the person signing.
- Each clause id should be a short lowercase identifier (e.g. "rent", "termination", "liability").`;

/**
 * Send extracted contract text to Gemini and receive a structured
 * AnalysisReport JSON object using structured output enforcement.
 */
export async function analyzeContract(contractText: string) {
  // Truncate extremely long contracts to stay within token limits
  const MAX_CHARS = 60_000;
  const text =
    contractText.length > MAX_CHARS
      ? contractText.slice(0, MAX_CHARS) +
        "\n\n[Remaining text truncated for analysis]"
      : contractText;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following contract:\n\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: SYSTEM_PROMPT
    }
  });

  const output = response.text;
  if (!output) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(output);
}
