import { getGeminiModel } from "../config/ai.config.js";

export const geminiStatus = {
  down: false,
  retryAfter: null
};

export const callGeminiWithTools = async (systemInstruction, messages, toolsConfig) => {
  if (geminiStatus.down && geminiStatus.retryAfter && Date.now() < geminiStatus.retryAfter) {
    console.warn("[Copilot] Gemini API skipped due to active circuit breaker (down). Fallback triggered.");
    return { fallback: true };
  }

  try {
    const model = getGeminiModel();
    const chatSession = model.startChat({
      history: messages,
      tools: toolsConfig ? [toolsConfig] : undefined,
      systemInstruction,
    });
    const result = await chatSession.sendMessage("continue");
    
    // Success - reset breaker
    geminiStatus.down = false;
    geminiStatus.retryAfter = null;
    
    return { result };
  } catch (error) {
    console.error("[Copilot] Gemini API call failed:", error.message);
    
    geminiStatus.down = true;
    const isQuota = error.message?.toLowerCase().includes("quota") || error.status === 429;
    
    if (isQuota) {
      const tomorrow = new Date();
      tomorrow.setUTCHours(8, 0, 0, 0); // approx midnight pacific
      if (tomorrow <= new Date()) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      geminiStatus.retryAfter = tomorrow.getTime();
      console.warn("[Copilot] Quota exhausted. Circuit breaker open until tomorrow.");
    } else if (error.message?.toLowerCase().includes("rate limit") || error.status === 429) {
      geminiStatus.retryAfter = Date.now() + 60 * 1000; // 60 seconds
      console.warn("[Copilot] Rate limited. Circuit breaker open for 60s.");
    } else {
      geminiStatus.retryAfter = Date.now() + 5 * 60 * 1000; // 5 minutes
      console.warn("[Copilot] Unknown error. Circuit breaker open for 5m.");
    }
    
    return { fallback: true };
  }
};
