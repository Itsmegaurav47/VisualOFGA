import CodeEditor from "./CodeEditor.jsx";
import { parseDslToJson } from "../utils/parseDsltoJson.js";
import { useEffect, useState } from "react";
import { EXAMPLES } from "../utils/EXAMPLES.js";

function ClipboardCopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
      />
    </svg>
  );
}

export default function EditorPanel({ dsl, setDsl, onSave, error }) {
  const [selectedExample, setSelectedExample] = useState("");
  const [originalDsl, setOriginalDsl] = useState("");
  const [isModified, setIsModified] = useState(false);

  const handleCopyDsl = () => {
    navigator.clipboard.writeText(dsl);
  };

  const handleCopyJson = () => {
    try {
      const json = JSON.stringify(parseDslToJson(dsl), null, 2);
      navigator.clipboard.writeText(json);
    } catch {
      alert("Invalid DSL, cannot convert to JSON.");
    }
  };

  // Handle dropdown selection
  const handleExampleChange = (e) => {
    const value = e.target.value;
    setSelectedExample(value);

    if (EXAMPLES[value]) {
      setDsl(EXAMPLES[value].trim());
      setOriginalDsl(EXAMPLES[value].trim());
      // setIsModified(true); // freshly loaded
    }
  };

  // Detect user edits
  useEffect(() => {
    // setIsModified(dsl.trim() !== originalDsl.trim());
    setIsModified(dsl.trim().length !== 0);
  }, [dsl, originalDsl]);

  return (
    <div className="h-full p-4 border-r border-gray-700 flex flex-col">
      {/* Header with copy icons */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-md font-semibold text-gray-300">
          AUTHORIZATION MODEL
        </div>
        <div className="flex space-x-2 items-center">
          {/* New Dropdown */}
          <select
            className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 text-sm"
            value={selectedExample}
            onChange={handleExampleChange}
          >
            <option value="">Select Example</option>
            <option value="demo">Demo</option>
            <option value="github">GitHub</option>
            <option value="gdrive">GDrive</option>
            <option value="entitlements">Entitlements</option>
            <option value="expenses">Expenses</option>
            <option value="iot">IoT</option>
            <option value="custom-roles">Custom Roles</option>
            <option value="slack">Slack</option>
          </select>

          {/* Existing Copy buttons */}
          <div
            className="group relative cursor-pointer flex items-center space-x-1 text-gray-400 hover:text-white"
            onClick={handleCopyJson}
          >
            <ClipboardCopyIcon className="h-5 w-5" />
            <span className="text-sm hidden md:inline">JSON</span>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-xs text-white px-2 py-1 rounded">
              Copy as JSON
            </span>
          </div>

          <div
            className="group relative cursor-pointer flex items-center space-x-1 text-gray-400 hover:text-white"
            onClick={handleCopyDsl}
          >
            <ClipboardCopyIcon className="h-5 w-5" />
            <span className="text-sm hidden md:inline">DSL</span>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-xs text-white px-2 py-1 rounded">
              Copy as DSL
            </span>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden mb-2">
        <CodeEditor dsl={dsl} setDsl={setDsl} />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!isModified}
        className={`self-end px-4 py-2 rounded text-white font-bold ${isModified ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 cursor-not-allowed"}`}
      >
        SAVE
      </button>
    </div>
  );
}
