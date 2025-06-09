import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { playSound } from "@/utils/playSound";
import CustomInput from "@/components/CustomInput";

interface PythagoreanProblem {
  displayA: string | number;
  displayB: string | number;
  displayC: string | number;
  valA?: number;
  valB?: number;
  valC?: number;
  unknownSide: "a" | "b" | "c";
  correctAnswer: number;
}

type Difficulty = "Easy" | "Medium" | "Hard"; // Added Difficulty type

function App6() {
  const [problem, setProblem] = useState<PythagoreanProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [actualAnswerDisplay, setActualAnswerDisplay] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem("pythagoreanDifficulty");
    return (savedDifficulty as Difficulty) || "Medium";
  });
  const [showHelpModal, setShowHelpModal] = useState(false); // State for help modal

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [focusCounter, setFocusCounter] = useState(0);

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  const generateQuestion = () => {
    let newProblem: PythagoreanProblem;
    const isHypotenuseUnknown = Math.random() < 0.75;

    let minLeg = 3;
    let maxLeg = 10; // Default to Medium

    switch (difficulty) {
      case "Easy":
        minLeg = 3;
        maxLeg = 5;
        break;
      case "Medium":
        minLeg = 3;
        maxLeg = 10;
        break;
      case "Hard":
        minLeg = 3;
        maxLeg = 15;
        break;
    }

    if (isHypotenuseUnknown) {
      const a = Math.floor(Math.random() * (maxLeg - minLeg + 1)) + minLeg;
      const b = Math.floor(Math.random() * (maxLeg - minLeg + 1)) + minLeg;
      newProblem = {
        displayA: a,
        displayB: b,
        displayC: "?",
        valA: a,
        valB: b,
        unknownSide: "c",
        correctAnswer: Math.sqrt(a * a + b * b),
      };
    } else {
      const isSideAUnknown = Math.random() < 0.5;
      const knownLeg =
        Math.floor(Math.random() * (maxLeg - minLeg + 1)) + minLeg;
      // Ensure c is larger than knownLeg and can lead to solvable problems within typical ranges.
      // Max c could be knownLeg + (maxLeg - minLeg + some_buffer) to keep numbers reasonable.
      // For simplicity, let c be knownLeg + (random value up to maxLeg's span or a fixed moderate value like 10)
      const cIncrement = Math.floor(Math.random() * (maxLeg - minLeg + 1)) + 1;
      let c = knownLeg + cIncrement;
      // Ensure c is at least knownLeg + 1, and also ensure c*c - knownLeg*knownLeg is not 0 or negative.
      // This can happen if cIncrement is too small and knownLeg is large.
      // A simple fix: ensure c is at least knownLeg + some_minimum_difference (e.g., 1 or 2)
      // Or, more robustly, ensure c*c > knownLeg*knownLeg
      // For now, the existing logic of c = knownLeg + (Math.floor(Math.random() * 10) + 1) was generally okay.
      // Let's adapt it slightly based on difficulty to scale the potential size of c.
      let cUpperRange = 10;
      if (difficulty === "Hard") cUpperRange = 12;
      if (difficulty === "Easy") cUpperRange = 7;
      c = knownLeg + (Math.floor(Math.random() * cUpperRange) + 1);

      if (isSideAUnknown) {
        // 'a' is unknown, 'b' is knownLeg
        newProblem = {
          displayA: "?",
          displayB: knownLeg,
          displayC: c,
          valB: knownLeg,
          valC: c,
          unknownSide: "a",
          correctAnswer: Math.sqrt(c * c - knownLeg * knownLeg),
        };
      } else {
        // 'b' is unknown, 'a' is knownLeg
        newProblem = {
          displayA: knownLeg,
          displayB: "?",
          displayC: c,
          valA: knownLeg,
          valC: c,
          unknownSide: "b",
          correctAnswer: Math.sqrt(c * c - knownLeg * knownLeg),
        };
      }
    }

    setProblem(newProblem);
    setUserAnswer("");
    setFeedback("");
    setIsAnswerChecked(false);
    setActualAnswerDisplay("");
    setFocusCounter((prev) => prev + 1);
    handleClearCanvas();
  };

  const checkAnswer = () => {
    if (userAnswer === "" || !problem) {
      setFocusCounter((prev) => prev + 1);
      return;
    }

    const userAnswerNum = parseFloat(userAnswer);
    const { correctAnswer, unknownSide } = problem;
    const isTargetInteger = Number.isInteger(correctAnswer);

    let isUserCorrect: boolean;
    if (isTargetInteger) {
      // For perfect integer results, user must be exact.
      // Allow for very minor floating point inaccuracies if correctAnswer was, e.g. 4.999999999999999
      isUserCorrect = Math.abs(userAnswerNum - correctAnswer) < 0.0001;
    } else {
      isUserCorrect = Math.abs(userAnswerNum - correctAnswer) <= 0.25;
    }

    const sideName =
      unknownSide === "a"
        ? "Side a"
        : unknownSide === "b"
        ? "Side b"
        : "Hypotenuse c";
    setActualAnswerDisplay(`The ${sideName} is ≈ ${correctAnswer.toFixed(2)}.`);

    if (isUserCorrect) {
      setFeedback("Correct! 🎉");
      setScore(score + 1);
      playSound(true);
    } else {
      setScore(0);
      setFeedback("Incorrect. 🔥");
      playSound(false);
    }
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]); // Add difficulty as a dependency

  useEffect(() => {
    localStorage.setItem("pythagoreanDifficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { top, width } = containerRef.current.getBoundingClientRect(); // Get width from the container itself
        // availableHeight is from the top of the canvas container to the bottom of the window, less a small buffer.
        const availableHeight = window.innerHeight - top - 20; // 20px buffer from viewport bottom
        setCanvasSize({
          width: width, // Use the actual width of the containerRef (which will be flex-grow)
          height: Math.max(availableHeight, 150), // Ensure min height
        });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [problem]); // Re-run if problem changes, as SVG visibility/layout might affect containerRef

  const handleEnterPress = () => {
    if (!isAnswerChecked) {
      checkAnswer();
    } else {
      nextQuestion();
    }
  };

  // SVG Triangle dimensions
  const svgWidth = 220;
  const svgHeight = 170;
  const p = 20; // padding
  const trianglePoints = `${p},${svgHeight - p} ${svgWidth - p},${
    svgHeight - p
  } ${p},${p}`;
  // Right angle symbol points
  const rightAnglePoints = `${p},${svgHeight - p - 20} ${p + 20},${
    svgHeight - p - 20
  } ${p + 20},${svgHeight - p}`;

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative">
      <div className="absolute top-4 right-4 flex flex-row items-center space-x-2">
        <Button
          onClick={() => setShowHelpModal(true)}
          variant="outline"
          size="sm"
        >
          Help
        </Button>
        <div className="bg-gray-100 p-2 rounded-md shadow inline-block">
          <p className="text-lg font-semibold">Streak: {score}</p>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full">
            <h3 className="text-2xl font-bold mb-4">
              How to Find the Missing Side
            </h3>
            <p className="mb-2">
              The Pythagorean theorem states: <strong>a² + b² = c²</strong>,
              where 'a' and 'b' are the lengths of the two shorter sides (legs)
              of a right-angle triangle, and 'c' is the length of the longest
              side (hypotenuse).
            </p>

            <h4 className="text-xl font-semibold mt-4 mb-2">
              1. Finding the Hypotenuse (c)
            </h4>
            <p className="mb-2">
              If you know the lengths of the two legs (a and b), you can find
              the hypotenuse (c) using:
            </p>
            <p className="mb-2 text-center bg-gray-100 p-2 rounded">
              <strong>c = √(a² + b²)</strong>
            </p>
            <p className="mb-2">Example: If a = 3 and b = 4:</p>
            <ul className="list-disc list-inside mb-2 space-y-1 pl-4">
              <li>a² = 3 x 3 = 9</li>
              <li>b² = 4 x 4 = 16</li>
              <li>a² + b² = 9 + 16 = 25</li>
              <li>c = √25 = 5</li>
            </ul>

            <h4 className="text-xl font-semibold mt-4 mb-2">
              2. Finding a Leg (e.g., a)
            </h4>
            <p className="mb-2">
              If you know the length of the hypotenuse (c) and one leg (e.g.,
              b), you can find the other leg (a) using:
            </p>
            <p className="mb-2 text-center bg-gray-100 p-2 rounded">
              <strong>a = √(c² - b²)</strong>
            </p>
            <p className="mb-2">Example: If c = 5 and b = 4:</p>
            <ul className="list-disc list-inside mb-4 space-y-1 pl-4">
              <li>c² = 5 x 5 = 25</li>
              <li>b² = 4 x 4 = 16</li>
              <li>c² - b² = 25 - 16 = 9</li>
              <li>a = √9 = 3</li>
            </ul>
            <p className="text-sm mb-3">
              Remember to estimate the square root if the result is not a
              perfect square (e.g., √8 ≈ 2.8).
            </p>
            <Button onClick={() => setShowHelpModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="text-2xl font-bold mb-2 text-center pt-10">
        {" "}
        {/* Added pt-10 for spacing */}
        Find the missing length?
      </div>
      <div className="text-xl italic mb-4 text-center">a² + b² = c²</div>

      {isAnswerChecked && actualAnswerDisplay && (
        <div className="text-xl text-center mb-4 font-semibold">
          {actualAnswerDisplay}
        </div>
      )}

      {feedback && (
        <div
          className={`text-2xl font-semibold text-center mb-2 ${
            feedback.includes("Correct") ? "text-green-500" : "text-red-700"
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="flex flex-col items-center space-y-4 mt-4 mb-4">
        <div className="flex items-center space-x-2 w-full max-w-md">
          <CustomInput
            type="number"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              if (isAnswerChecked) {
                setFeedback("");
                setActualAnswerDisplay("");
              } else {
                setFeedback("");
              }
            }}
            onEnterPress={handleEnterPress}
            placeholder="Enter length (0.01)"
            focusCounter={focusCounter}
            className="flex-grow p-2 text-xl border rounded" // Use flex-grow
            step="0.01"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="p-2 text-xl border rounded bg-white h-full" // Match height and style
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="flex space-x-4">
          {!isAnswerChecked ? (
            <Button onClick={checkAnswer} size="lg">
              Check Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion} size="lg">
              Next Question
            </Button>
          )}
        </div>
      </div>

      {/* NEW Flex container for SVG and DrawingCanvas */}
      <div className="flex flex-row items-start mt-4 space-x-4">
        {/* SVG Triangle (Left) */}
        {problem && (
          <div style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}>
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              <polygon
                points={trianglePoints}
                className="fill-none stroke-black stroke-2"
              />
              <polyline
                points={rightAnglePoints}
                className="fill-none stroke-black stroke-1"
              />
              {/* Labels */}
              <text
                x={svgWidth / 2}
                y={svgHeight - p + 15}
                textAnchor="middle"
                className="text-lg fill-current"
              >
                {problem.unknownSide === "a" &&
                problem.valC &&
                problem.valB === problem.displayB
                  ? problem.displayA
                  : problem.displayA}
              </text>
              <text
                x={p - 5}
                y={svgHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-lg fill-current"
              >
                {problem.unknownSide === "b" &&
                problem.valC &&
                problem.valA === problem.displayA
                  ? problem.displayB
                  : problem.displayB}
              </text>
              <text
                x={(svgWidth + p * 2) / 2.5}
                y={p * 2.5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg fill-blue-600 font-semibold"
              >
                {problem.displayC}
              </text>
            </svg>
          </div>
        )}
        {/* Placeholder to maintain space if problem is null, preventing layout shift */}
        {!problem && (
          <div style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }} />
        )}

        {/* Drawing Canvas Area (Right) */}
        <div
          ref={containerRef}
          className="relative flex-grow"
          style={{ height: `${canvasSize.height}px` }}
        >
          <Button
            onClick={handleClearCanvas}
            className="absolute top-0 right-0 z-10" /* Adjusted position */
            size="sm"
            variant="outline"
          >
            Clear
          </Button>
          <DrawingCanvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
          />
        </div>
      </div>
    </div>
  );
}

export default App6;
