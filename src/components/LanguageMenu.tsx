import { useAnalysisContext } from "../contexts/AnalysisContext";

/**
 * 🌐 A dropdown component for selecting the analysis language.
 */
export const LanguageMenu = () => {
  const { language: selectedLanguage, setLanguage } = useAnalysisContext();
  const languages = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "Go",
    "Ruby",
    "C#",
    "PHP",
    "Swift",
    "Kotlin",
  ];

  return (
    <div className="bg-gray-900/50 text-white p-4 rounded-lg shadow-lg w-72 mt-1 backdrop-blur-sm">
      <p className="text-slate-300/80 text-xs px-2 pb-1">Language</p>
      <ul className="space-y-1">
        {languages.map((lang) => (
          <li
            key={lang}
            className={`p-2 hover:bg-slate-900 rounded-md cursor-pointer ${
              selectedLanguage === lang
                ? "text-blue-400 bg-slate-900"
                : "text-white"
            }`}
            onClick={() => setLanguage(lang)}
          >
            {lang}
          </li>
        ))}
      </ul>
    </div>
  );
};
