import { ipcMain, type IpcMainInvokeEvent, app } from "electron";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import path from "path";
import { prompts } from "./prompts";
import { type ChatMessage } from "../types/electron";
import { getConfig, getOpenAIClient } from "./config";
import { IPC_CHANNELS } from "../constants/ipcChannels";

/**
 * 🧹 Sanitizes user input to remove potentially harmful characters.
 */
const sanitize = (input: string): string => {
  if (typeof input !== "string") return "";
  return input.trim().replace(/`/g, "'");
};

/**
 * 🛡️ Validates and sanitizes a file path to prevent traversal.
 */
function sanitizeAndValidatePath(filePath: string): string {
  const userDataPath = app.getPath("userData");
  const tempPath = app.getPath("temp");

  const resolvedPath = path.resolve(filePath);

  if (
    !resolvedPath.startsWith(userDataPath) &&
    !resolvedPath.startsWith(tempPath)
  ) {
    throw new Error("Attempted to access a restricted file path.");
  }

  return resolvedPath;
}

/**
 * 🗣️ Handles chat and screenshot analysis completion requests.
 */
async function handleChatCompletion(
  event: IpcMainInvokeEvent,
  {
    messages,
    model,
    imagePaths,
    promptType,
    requestId,
    language,
  }: {
    messages: ChatMessage[];
    model?: string;
    imagePaths?: string[];
    promptType: "chat" | "mcq" | "code";
    requestId?: string;
    language?: string;
  }
) {
  const sanitizedMessages = messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { ...msg, content: sanitize(msg.content) };
    }
    if (Array.isArray(msg.content)) {
      const sanitizedParts = msg.content.map((part) => {
        if (part.type === "text") {
          return { ...part, text: sanitize(part.text) };
        }
        return part;
      });
      return { ...msg, content: sanitizedParts };
    }
    return msg;
  });

  let finalMessages: OpenAI.ChatCompletionMessageParam[] =
    sanitizedMessages as OpenAI.ChatCompletionMessageParam[];

  if (imagePaths && imagePaths.length > 0) {
    let imageContents;
    try {
      imageContents = await Promise.all(
        imagePaths.map(async (p) => {
          const validatedPath = sanitizeAndValidatePath(p);
          const imageBuffer = await readFile(validatedPath);
          const imageBase64 = imageBuffer.toString("base64");
          return {
            type: "image_url" as const,
            image_url: { url: `data:image/png;base64,${imageBase64}` },
          };
        })
      );
    } catch (error) {
      console.error("Error processing image paths:", error);
      event.sender.send(IPC_CHANNELS.CHAT_ERROR, {
        error: "Invalid image path provided. Please use a valid file.",
        requestId,
      });
      event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
      return;
    }
    finalMessages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze these screenshots and provide a solution.",
          },
          ...imageContents,
        ],
      },
    ];
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

  const systemPrompt =
    promptType === "code"
      ? (prompts.code as (language: string) => string)(language || "Python")
      : prompts[promptType] || prompts.chat;
  const openai = getOpenAIClient();
  const selectedModel = model || config.model || "gpt-4o";

  try {
    // For 'code' or 'mcq' analysis, we expect a single structured JSON response
    if (promptType === "code" || promptType === "mcq") {
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...finalMessages,
        ],
        stream: false,
      });

      const content = completion.choices[0]?.message?.content || "";
      event.sender.send(IPC_CHANNELS.CHAT_CHUNK, { content, requestId });
      event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
      return;
    }

    // For general chat stream
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "system", content: systemPrompt }, ...finalMessages],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        event.sender.send(IPC_CHANNELS.CHAT_CHUNK, { content, requestId });
      }
    }
    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
  } catch (error: unknown) {
    const apiError = error as { status?: number; message: string };
    console.error(
      `API Error: ${apiError.message}, Status: ${apiError.status}`
    );
    event.sender.send(IPC_CHANNELS.CHAT_ERROR, {
      error: apiError.message || "Failed to get response from the model.",
      requestId,
    });
    event.sender.send(IPC_CHANNELS.CHAT_END, { requestId });
  }
}

/**
 * 📡 Registers all API-related IPC handlers.
 */
export function registerApiHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.CHAT_COMPLETION,
    (
      event,
      {
        messages,
        model,
      }: {
        messages: ChatMessage[];
        model?: string;
      }
    ) => {
      return handleChatCompletion(event, {
        messages,
        model,
        promptType: "chat",
      });
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.ANALYZE_SCREENSHOTS,
    (
      event,
      {
        imagePaths,
        view,
        requestId,
        language,
      }: {
        imagePaths: string[];
        view: "code" | "mcq" | "chat";
        requestId: string;
        language: string;
      }
    ) => {
      return handleChatCompletion(event, {
        messages: [],
        imagePaths,
        promptType: view,
        requestId,
        language,
      });
    }
  );
}
