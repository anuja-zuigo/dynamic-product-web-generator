import { callGeminiWithTools } from "./llm.service.js";
import { copilotToolsDeclaration, executeCopilotTool } from "../tools/index.js";
import Product from "../models/Product.js";

const SYSTEM_INSTRUCTION = "You are ProductGen AI Copilot. Use the available tools to answer queries about the store's products, inventory, and analytics. Be concise and friendly. Format your answers in markdown. Do NOT invent numbers; always call tools if you need data.";

export const handleCopilotChat = async (history, message, currentPage) => {
  const geminiHistory = history.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  geminiHistory.push({ role: 'user', parts: [{ text: message }] });

  let result = await callGeminiWithTools(SYSTEM_INSTRUCTION, geminiHistory, copilotToolsDeclaration);

  if (result.fallback) {
    return handleFallback(message, currentPage);
  }

  // Handle Tool Calls
  let responseText = "";
  const functionCalls = result.result.response.functionCalls();
  
  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      console.log(`[Copilot] Executing tool: ${call.name}`);
      const toolResponse = await executeCopilotTool(call);
      
      geminiHistory.push(result.result.response.candidates[0].content); // Add model's tool call
      geminiHistory.push({
        role: "function",
        parts: [{
          functionResponse: {
            name: call.name,
            response: toolResponse
          }
        }]
      });
    }
    
    // Call Gemini again with the tool responses
    result = await callGeminiWithTools(SYSTEM_INSTRUCTION, geminiHistory);
    if (result.fallback) return handleFallback(message, currentPage);
    responseText = result.result.response.text();
  } else {
    responseText = result.result.response.text();
  }

  return responseText;
};

// Fallback logic when Gemini is down
const handleFallback = async (message, currentPage) => {
  try {
    const allProducts = await Product.find({});
    const total = allProducts.length;
    const active = allProducts.filter(p => p.status === "ACTIVE").length;
    
    return `I'm having trouble reaching the AI right now, but here's the data directly: You have **${total} total products** (${active} active) in your catalog.`;
  } catch (err) {
    return "I'm having trouble reaching the AI right now, and the database is temporarily unavailable.";
  }
};
