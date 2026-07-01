import type { VercelRequest, VercelResponse } from "@vercel/node";

// Polyfill Promise.withResolvers for Node runtimes < v22 (e.g. Vercel Node 18/20)
if (typeof (Promise as any).withResolvers === "undefined") {
  (Promise as any).withResolvers = function () {
    let resolve: any;
    let reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { chatWithContract } from "../server/chatWithContract.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { contractText, history, newMessage } = req.body;
  if (!contractText || typeof newMessage !== "string") {
    return res.status(400).json({ error: "Missing contractText or newMessage." });
  }

  try {
    const reply = await chatWithContract(contractText, history || [], newMessage);
    return res.status(200).json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat error:", message);
    return res.status(500).json({ error: "Failed to generate reply. Please try again." });
  }
}
