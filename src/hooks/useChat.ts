import { useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import type { ChatMessage } from "../../electron/types/electron";

// ✨ Custom Hook for Chat, optimized for streaming and unified history persistence
export const useChat = () => {
  const {
    analyses,
    setAnalysisState,
    saveToHistory,
    loadHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
    startNewSession,
    history,
  } = useAnalysisContext();

  const {
    analysis: messages = [],
    isLoading,
    error,
    currentRequestId,
    chatId,
  } = analyses.chat || {};

  const currentRequestIdRef = useRef(currentRequestId);
  useEffect(() => {
    currentRequestIdRef.current = currentRequestId;
  }, [currentRequestId]);

  // 🆔 Generate a unique chatId if one doesn't exist
  useEffect(() => {
    if (!chatId) {
      setAnalysisState("chat", { chatId: uuidv4(), analysis: [] });
    }
  }, [chatId, setAnalysisState]);

  useEffect(() => {
    const handleChunk = ({
      content,
      requestId,
    }: {
      content: string;
      requestId?: string;
    }) => {
      if (requestId !== currentRequestIdRef.current) return;

      setAnalysisState("chat", (prevState) => {
        const prevMessages = prevState.analysis || [];
        const lastMessage = prevMessages[prevMessages.length - 1];

        if (lastMessage?.role === "assistant") {
          const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.content + content,
          };
          return {
            ...prevState,
            analysis: [...prevMessages.slice(0, -1), updatedLastMessage],
          };
        }
        return {
          ...prevState,
          analysis: [...prevMessages, { role: "assistant", content }],
        };
      });
    };

    const handleEnd = ({ requestId }: { requestId?: string }) => {
      if (requestId === currentRequestIdRef.current) {
        setAnalysisState("chat", (prevState) => {
          if (
            prevState.chatId &&
            prevState.analysis &&
            prevState.analysis.length > 0
          ) {
            saveToHistory("chat", prevState.chatId, prevState.analysis);
          }
          return {
            ...prevState,
            isLoading: false,
            currentRequestId: null,
          };
        });
      }
    };

    const handleError = ({
      error,
      requestId,
    }: {
      error: string;
      requestId?: string;
    }) => {
      if (requestId === currentRequestIdRef.current) {
        setAnalysisState("chat", {
          error,
          isLoading: false,
          currentRequestId: null,
        });
      }
    };

    const unsubscribeChunk = window.electronAPI.chat.onChunk(handleChunk);
    const unsubscribeError = window.electronAPI.chat.onError(handleError);
    const unsubscribeEnd = window.electronAPI.chat.onEnd(handleEnd);

    return () => {
      unsubscribeChunk();
      unsubscribeError();
      unsubscribeEnd();
    };
  }, [setAnalysisState, saveToHistory]);

  const sendMessage = useCallback(
    (input: string) => {
      if (!input.trim() || isLoading || !chatId) return;

      const requestId = uuidv4();
      const userMessage: ChatMessage = { role: "user", content: input };

      setAnalysisState("chat", (prevState) => {
        const updatedMessages = [...(prevState.analysis || []), userMessage];
        if (prevState.chatId) {
          saveToHistory("chat", prevState.chatId, updatedMessages);
        }
        return {
          ...prevState,
          analysis: updatedMessages,
          isLoading: true,
          error: null,
          currentRequestId: requestId,
        };
      });

      window.electronAPI.chat.sendChatMessage({
        message: input,
        chatId,
        requestId,
      });
    },
    [isLoading, setAnalysisState, chatId, saveToHistory]
  );

  const clearChat = useCallback(() => {
    startNewSession("chat");
  }, [startNewSession]);

  return {
    messages,
    isLoading,
    error,
    chatId,
    sendMessage,
    clearChat,
    startNewSession,
    history,
    loadHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
  };
};
