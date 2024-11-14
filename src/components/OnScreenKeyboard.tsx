import React from "react";

interface OnScreenKeyboardProps {
  onKeyPress: (key: string) => void;
  language?: string;
}

export const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({
  onKeyPress,
  language = "en-CA",
}) => {
  const regularKeys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "'"],
  ];
  const frenchKeys = [
    "é",
    "è",
    "ê",
    "ë",
    "à",
    "â",
    "ù",
    "û",
    "î",
    "ï",
    "ô",
    "ç",
  ];
  const germanKeys = ["ä", "ö", "ü", "ß"];

  let specialKeys: string[] = [];
  if (language.includes("fr")) {
    specialKeys = frenchKeys;
  } else if (language.includes("de")) {
    specialKeys = germanKeys;
  }

  const baseKeyStyles =
    "bg-white rounded-lg shadow px-4 py-2 text-lg hover:bg-gray-50";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-2">
      <div className="flex flex-col gap-2 max-w-3xl mx-auto">
        {/* First row with backspace */}
        <div className="flex justify-center gap-2">
          {regularKeys[0].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={baseKeyStyles}
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => onKeyPress("Backspace")}
            className="bg-red-100 rounded-lg shadow px-4 py-2 text-lg hover:bg-red-200"
          >
            ⌫
          </button>
        </div>

        {/* Second row with enter */}
        <div className="flex justify-center gap-2">
          {regularKeys[1].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={baseKeyStyles}
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => onKeyPress("Enter")}
            className="bg-blue-100 rounded-lg shadow px-4 py-2 text-lg hover:bg-blue-200 min-w-[5rem]"
          >
            Enter ↵
          </button>
        </div>

        {/* Third row */}
        <div className="flex justify-center gap-2">
          {regularKeys[2].map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={baseKeyStyles}
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => onKeyPress(" ")}
            className="bg-green-100 rounded-lg shadow px-4 py-2 text-lg hover:bg-blue-200 min-w-[5rem]"
          >
            Space ␣
          </button>
        </div>

        {/* Special characters row */}
        <div className="flex flex-wrap justify-center gap-2">
          {specialKeys.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={baseKeyStyles}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
