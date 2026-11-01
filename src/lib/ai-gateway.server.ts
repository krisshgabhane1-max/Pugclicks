// Server-only Lovable AI Gateway helpers (Responses API, AI SDK).
// Never import this file from a route or component; server functions
// load it inside the handler with a dynamic import.

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    getRunId: () => runId,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  };
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

export const LOVABLE_AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

/**
 * Streams a one-shot Responses call server-side and exposes the final text.
 * Callers await `result.text` before returning anything to the browser.
 */
export function createResponsesCall(
  request: Request,
  config: { apiKey: string; model: string },
  instructions: string,
  messages: ModelMessage[],
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: LOVABLE_AI_GATEWAY_URL,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(config.model),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return { result, text: result.text };
}

/** Turns a gateway failure into a short, safe message for the UI. */
export function safeAiErrorMessage(error: unknown): string {
  const err = error as { statusCode?: number; name?: string; message?: string } | undefined;
  const status = err?.statusCode;
  if (status === 402) return "The workspace needs more AI credits for this feature.";
  if (status === 401) return "AI is not configured on the server. Ask the site owner to check the AI key.";
  if (status === 403) return err?.message || "The AI request was not allowed.";
  if (status === 404) return "The AI model is unavailable right now. Please try again later.";
  if (status === 429) return "The AI is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  if (err?.name === "AbortError") return "The request was cancelled.";
  return err?.message || "The AI request failed. Please try again.";
}
