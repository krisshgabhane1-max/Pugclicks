import { createServerFn, getRequest } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/roles.functions";

export type SecurityReport = {
  id: string;
  description: string;
  analysis: string;
  created_at: string;
};

const SYSTEM_PROMPT = `You are a senior account-security advisor for Pugclicks, a small publishing site. An administrator describes suspicious account or login activity they noticed. Analyze ONLY what they describe — never invent facts, log entries, IP addresses, or incidents that are not in the description.

Write a practical, well-structured response in markdown with these sections:
## What this likely means
A short, honest assessment, including uncertainty. If the description looks like a common phishing pattern, say so clearly.
## Do this now
Numbered, concrete, prioritized steps (3-6) the admin should take immediately. Be specific (e.g. "change the password from a trusted device", "sign out all other sessions", "check active sessions in the account settings"), not generic advice.
## How to verify
How to confirm whether the activity was legitimate or an intrusion, using information the admin can realistically obtain.
## Prevent this next time
3-5 concrete prevention measures suited to a small site admin.

Keep the whole answer under 400 words. Plain, calm, professional language. Never claim certainty you do not have.`;

export const analyzeSecurityReport = createServerFn({ method: "POST" })
  .inputValidator((input: { description: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);

    const description = data.description.trim();
    if (description.length < 10) {
      return { ok: false as const, error: "Please describe what happened in at least one sentence." };
    }
    if (description.length > 4000) {
      return { ok: false as const, error: "Please keep the description under 4,000 characters." };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "AI is not configured on the server yet." };
    }

    const { createResponsesCall, safeAiErrorMessage, LOVABLE_AI_GATEWAY_URL } = await import(
      "@/lib/ai-gateway.server"
    );
    const request = getRequest();

    try {
      const { result } = createResponsesCall(
        request,
        { apiKey, model: "openai/gpt-6-astra" },
        SYSTEM_PROMPT,
        [{ role: "user", content: description }],
      );
      const analysis = (await result.text).trim();
      if (!analysis) {
        return { ok: false as const, error: "The AI returned an empty response. Please try again." };
      }

      const { error } = await context.supabase.from("security_reports").insert({ description, analysis });
      if (error) throw new Error(error.message);

      return { ok: true as const, analysis };
    } catch (error) {
      return { ok: false as const, error: safeAiErrorMessage(error) };
    }
  });

export const listSecurityReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SecurityReport[]> => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("security_reports")
      .select("id, description, analysis, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return (data ?? []) as SecurityReport[];
  });
