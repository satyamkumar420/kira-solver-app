import { useMemo } from "react";
import { useAnalysisContext } from "../contexts/AnalysisContext";
import { ScreenshotManager } from "../components/ScreenshotManager";
import {
  LoadingSpinner,
  FileQuestionIcon,
  CheckCircleIcon,
  SearchIcon,
} from "../components/Icons";
import { CodeRender } from "../components/MarkdownRenderer";

// Define the structure of the analysis result
interface McqAnalysis {
  question: string;
  correct_answer: string;
  explanation: Record<string, string>;
}

// McqView Component
export const McqView = () => {
  const { analyses } = useAnalysisContext();
  const { analysis, isLoading, error } = analyses.mcq || {};

  const fullContent = useMemo(
    () => analysis?.map((msg) => msg.content).join("") || "",
    [analysis]
  );

  const parsedAnalyses = useMemo<McqAnalysis[] | null>(() => {
    if (!fullContent || isLoading) return null;
    try {
      const cleanedAnalysis = fullContent.replace(/```json\s*|```/g, "").trim();
      const parsed = JSON.parse(cleanedAnalysis);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Failed to parse MCQ analysis JSON:", e);
      return null;
    }
  }, [fullContent, isLoading]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto p-4">
        <h1 className="text-base font-semibold text-white mb-2 border-b border-slate-700 pb-2">
          MCQ Solver
        </h1>
        {isLoading && (!analysis || analysis.length === 0) && (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <LoadingSpinner className="animate-spin h-8 w-8 mx-auto text-indigo-200" />
              <p className="mt-2 text-slate-400 text-sm">Analyzing Screenshots...</p>
            </div>
          </div>
        )}
        {parsedAnalyses && !isLoading && (
          <div className="space-y-6 text-white">
            {parsedAnalyses.map((mcq, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/40"
              >
                <div>
                  <h2 className="text-sm font-semibold mb-1.5 text-blue-400 flex items-center gap-1.5">
                    <FileQuestionIcon className="w-4 h-4 text-blue-400" />
                    <span>Question {index + 1}:</span>
                  </h2>
                  <p className="text-white/90 text-sm leading-relaxed">{mcq.question}</p>
                </div>

                <div className="mt-4">
                  <h2 className="text-sm font-semibold mb-1.5 text-green-400 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span>Correct Answer:</span>{" "}
                    <span className="text-base font-bold text-green-400 ml-1">
                      {mcq.correct_answer}
                    </span>
                  </h2>
                </div>

                <div className="mt-4">
                  <h2 className="text-sm font-semibold mb-2 text-purple-400 flex items-center gap-1.5">
                    <SearchIcon className="w-4 h-4 text-purple-400" />
                    <span>Explanation:</span>
                  </h2>
                  <ul className="space-y-2">
                    {mcq.explanation &&
                      Object.entries(mcq.explanation).map(([option, expl]) => (
                        <li
                          key={option}
                          className={`p-2.5 rounded-md text-sm ${
                            option === mcq.correct_answer
                              ? "bg-green-950/40 border-l-4 border-green-500"
                              : "bg-red-950/30 border-l-4 border-red-500/50"
                          }`}
                        >
                          <span className="font-semibold">{option}:</span>{" "}
                          <CodeRender
                            text={expl}
                            className={
                              option === mcq.correct_answer
                                ? "bg-green-900/50 border-green-500"
                                : "bg-red-900/50 border-red-500"
                            }
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && (!analysis || analysis.length === 0) && (
          <p className="text-slate-400 text-center mt-4 text-sm">
            Solve multiple-choice questions by taking a screenshot{" "}
            <kbd className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 text-xs">
              CTRL + H
            </kbd>
          </p>
        )}
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>
      <ScreenshotManager view="mcq" />
    </div>
  );
};
