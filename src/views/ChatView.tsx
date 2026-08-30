import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { LoadingSpinner } from "../components/Icons";
import { ChatMessage } from "../components/ChatMessage";
import { ScreenshotManager } from "../components/ScreenshotManager";

// 💬 ChatView Component
export const ChatView = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 👇 Scroll to the bottom of the messages
  const scrollToBottom = () => {
    // Use "auto" to prevent flickering from smooth scroll animation
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // 📝 Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  // 👂 Listen for events from the main process
  useEffect(() => {
    // ✨ Clear all data
    const unsubscribeClearAll = window.electronAPI.onClearAll(() => {
      clearChat();
    });

    // keydown event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
      }
    };

    // ➕ Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // ➖ Remove event listener on cleanup
    return () => {
      unsubscribeClearAll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearChat]);

  // 💬 Handle message submission
  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // ⌨️ Handle key down for sending message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div ref={chatContainerRef} className="flex flex-col h-full text-white ">
      <form onSubmit={handleSubmit} className="flex mb-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 text-white bg-slate-900/20 border border-gray-800 rounded-l-lg focus:outline-none resize-none overflow-hidden pl-4 max-h-48"
          placeholder={isLoading ? "Generating..." : "Ask anything..."}
          disabled={isLoading}
          rows={1}
          autoFocus
          spellCheck="false"
        />
        <button
          type="submit"
          className="p-2 text-white bg-slate-900 rounded-r-lg disabled:bg-slate-900 self-end px-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner className="text-indigo-200 animate-spin" />
          ) : (
            "Send"
          )}
        </button>
      </form>
      <ScreenshotManager view="chat" />
      {error && (
        <div className="p-3 my-2 text-red-300 bg-red-900/30 rounded-lg border border-red-800/50">
          <p className="font-bold text-red-200">Request Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
