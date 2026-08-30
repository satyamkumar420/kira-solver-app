import { IpcMainInvokeEvent } from "electron";
import OpenAI from "openai";
import { prompts } from "./prompts";
import { getConfig, getOpenAIClient } from "./config";
import { IPC_CHANNELS } from "../constants/ipcChannels";

/**
 * 🧹 Sanitizes user input to remove potentially harmful characters.
 */
const sanitize = (input: string): string => {
  if (typeof input !== "string") return "";
  return input.trim().replace(/`/g, "'");
};

interface MessageEntry {
  role: "user" | "assistant" | "system";
  content: string;
}

// ⛓️ In-memory store for chat sessions
const chatSessions = new Map<string, MessageEntry[]>();

/**
 * 🗣️ Handles streaming chat completion requests using native OpenAI SDK.
 */
export async function handleOpenaiChatCompletion(
  event: IpcMainInvokeEvent,
  {
    chatId,
    message,
    model,
    requestId,
  }: {
    chatId: string;
    message: string;
    model?: string;
    requestId?: string;
  }
) {
  const sanitizedMessage = sanitize(message);

  if (!chatId || !sanitizedMessage) {
    console.error("🚫 Missing chatId or message for chat completion.");
    event.sender.send(IPC_CHANNELS.CHAT_ERROR, {
      error: "Chat ID and message are required.",
      requestId,
    });
    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
    return;
  }

  const config = getConfig();
  if (!config.apiKey) {
    event.sender.send(IPC_CHANNELS.CHAT_ERROR, {
      error: "API Key is missing. Please open Settings (⚙️) and configure your OpenAI-compatible API Key.",
      requestId,
    });
    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
    return;
  }

  // Retrieve or create chat history for this session
  if (!chatSessions.has(chatId)) {
    chatSessions.set(chatId, []);
  }
  const history = chatSessions.get(chatId)!;

  const openai = getOpenAIClient();
  const selectedModel = model || config.model || "gpt-4o";

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: prompts.chat },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: sanitizedMessage },
    ];

    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        event.sender.send(IPC_CHANNELS.CHAT_CHUNK, {
          content,
          requestId,
        });
      }
    }

    // Update conversation history
    history.push({ role: "user", content: sanitizedMessage });
    history.push({ role: "assistant", content: fullResponse });

    // Cap history size to prevent unbounded memory growth (keep last 30 messages)
    if (history.length > 30) {
      chatSessions.set(chatId, history.slice(-30));
    }

    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
  } catch (error: unknown) {
    const apiError = error as {
      status?: number;
      message: string;
    };

    console.error(`API Error: ${apiError?.message}, Status: ${apiError?.status}`);
    event.sender.send(IPC_CHANNELS.CHAT_ERROR, {
      error:
        apiError?.message ||
        "Failed to get a response from the model. Please check your connection and try again.",
      requestId,
    });
    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
  }
}

/**
 * 🧹 Clears memory for a specific chat session or all sessions.
 */
export function clearChatSession(chatId?: string) {
  if (chatId) {
    chatSessions.delete(chatId);
  } else {
    chatSessions.clear();
  }
}
