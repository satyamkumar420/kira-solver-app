import { memo } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage as ChatMessageType } from "../../electron/types/electron";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const hasImages = Array.isArray(message.images) && message.images.length > 0;

  return (
    <div
      className={`flex items-start gap-2.5 my-2.5 ${
        isUser ? "justify-end" : ""
      }`}
    >
      {/* AI Bot Icon */}
      {!isUser && (
        <img
          src="bot.png"
          alt="Bot"
          width={24}
          height={24}
          className="flex-shrink-0 mt-1"
        />
      )}

      {/* Message Content Bubble */}
      <div
        className={`px-3.5 py-2.5 rounded-lg max-w-[85%] ${
          isUser
            ? "bg-slate-900/70 border border-slate-800 text-white rounded-br-none"
            : "bg-slate-950/40 text-slate-200"
        }`}
      >
        {/* Attached Screen Capture Small Thumbnails */}
        {hasImages && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                Screen Capture ({message.images?.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.images?.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Capture ${idx + 1}`}
                  className="w-16 h-12 object-cover rounded border border-slate-700/60 shadow-sm hover:scale-105 transition-transform"
                  title="Screen capture snippet"
                />
              ))}
            </div>
          </div>
        )}

        {/* Text Content */}
        {typeof message.content === "string" && (
          <div className="text-sm leading-relaxed">
            <MarkdownRenderer>{message.content}</MarkdownRenderer>
          </div>
        )}
      </div>

      {/* User Icon */}
      {isUser && (
        <img
          src="user.png"
          alt="User"
          width={24}
          height={24}
          className="flex-shrink-0 mt-1"
        />
      )}
    </div>
  );
});
