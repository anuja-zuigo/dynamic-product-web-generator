import { handleCopilotChat } from "../services/copilot.service.js";

export const chat = async (req, res) => {
  try {
    const { message, history = [], currentPage = '/' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const aiResponse = await handleCopilotChat(history, message, currentPage);
    
    return res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error("[Copilot Controller Error]:", error);
    return res.status(500).json({ error: "An error occurred while processing your request." });
  }
};
