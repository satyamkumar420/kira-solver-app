import { useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import type { ChatMessage } from "../../electron/types/electron";

// ✨ Custom Hook for Screenshot Analysis with History Integration
export const useAnalysis = (view: "code" | "mcq" | "chat") => {
  const {
    analyses,
    setAnalysisState,
    clearAnalysis: clearAnalysisContext,
    saveToHistory,
    language,
  } = useAnalysisContext();

  const {
    analysis,
    isLoading,
    error,
    currentRequestId,
    chatId,
  } = analyses[view] || {
    analysis: [],
    isLoading: false,
    error: null,
    currentRequestId: null,
  };

  // Ensure unique ID exists for this view
  useEffect(() => {
    if (!chatId && view !== "chat") {
      setAnalysisState(view, { chatId: uuidv4() });
    }
  }, [chatId, view, setAnalysisState]);

  const currentRequestIdRef = useRef(currentRequestId);
  useEffect(() => {
    currentRequestIdRef.current = currentRequestId;
  }, [currentRequestId]);

  useEffect(() => {
    const handleChunk = ({
      content,
      requestId,
    }: {
      content: string;
      requestId?: string;
    }) => {
      if (view === "chat") return;
      if (requestId !== currentRequestIdRef.current) return;

      const message: ChatMessage = { role: "assistant", content };
      setAnalysisState(view, {
        analysis: [message],
      });
    };

    const handleEnd = ({ requestId }: { requestId?: string }) => {
      if (view === "chat") return;
      if (requestId === currentRequestIdRef.current) {
        setAnalysisState(view, (prevState) => {
          const messages = prevState.analysis || [];
          if (prevState.chatId && messages.length > 0) {
            saveToHistory(view, prevState.chatId, messages, language);
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
      if (view === "chat") return;
      if (requestId === currentRequestIdRef.current) {
        setAnalysisState(view, {
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
  }, [view, setAnalysisState, saveToHistory, language]);

  const startAnalysis = useCallback(
    (
      screenshots: { path: string; dataUrl?: string }[],
      currentLanguage: string
    ) => {
      if (screenshots.length === 0 || isLoading) return;

      const requestId = uuidv4();
      const newChatId = uuidv4();

      if (view === "chat") {
        const count = screenshots.length;
        const promptText =
          count === 1
            ? "Explain and solve the problem shown in this screen capture."
            : `Analyze and solve the problem across these ${count} captured screens.`;

        const images = screenshots
          .map((s) => s.dataUrl)
          .filter(Boolean) as string[];

        const userMessage: ChatMessage = {
          role: "user",
          content: promptText,
          images: images.length > 0 ? images : undefined,
        };

        setAnalysisState("chat", (prevState) => ({
          ...prevState,
          analysis: [...(prevState.analysis || []), userMessage],
          isLoading: true,
          error: null,
          currentRequestId: requestId,
          chatId: prevState.chatId || newChatId,
        }));
      } else {
        setAnalysisState(view, {
          analysis: [],
          isLoading: true,
          error: null,
          currentRequestId: requestId,
          chatId: newChatId,
        });
      }

      const paths = screenshots.map((s) => s.path);
      window.electronAPI.screenshot.analyzeScreenshots(
        paths,
        view,
        requestId,
        currentLanguage
      );
    },
    [view, isLoading, setAnalysisState]
  );

  const clearAnalysis = useCallback(() => {
    clearAnalysisContext(view);
    setAnalysisState(view, { chatId: uuidv4(), analysis: [] });
  }, [view, clearAnalysisContext, setAnalysisState]);

  return {
    analysis,
    isLoading,
    error,
    startAnalysis,
    clearAnalysis,
    currentRequestId,
    chatId,
  };
};
