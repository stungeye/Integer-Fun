import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { playSound } from "@/utils/playSound";
import CustomInput from "@/components/CustomInput";

type Difficulty = "Easy" | "Medium" | "Hard"; // Added Difficulty type

function App5() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [actualSqrtDisplay, setActualSqrtDisplay] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem("sqrtDifficulty");
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
    let minNum = 4;
    let maxNum = 100;

    switch (difficulty) {
      case "Easy":
        minNum = 4;
        maxNum = 100;
        break;
      case "Medium":
        minNum = 49;
        maxNum = 144;
        break;
      case "Hard":
        minNum = 81;
        maxNum = 256;
        break;
    }
    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    setCurrentNumber(num);
    setUserAnswer("");
    setFeedback("");
    setIsAnswerChecked(false);
    setActualSqrtDisplay("");
    setFocusCounter((prev) => prev + 1);
  };

  const calculateActualSqrt = (num: number): number => {
    return Math.sqrt(num);
  };

  const checkAnswer = () => {
    if (userAnswer === "" || currentNumber === null) {
      setFocusCounter((prev) => prev + 1);
      return;
    }

    const correctAnswer = calculateActualSqrt(currentNumber);
    const userAnswerNum = parseFloat(userAnswer);
    const isPerfectSquare = Number.isInteger(correctAnswer);

    let isCorrect = false;
    const tolerance = 0.25; // User's answer is correct if Math.abs(userAnswerNum - correctAnswer) <= 0.5

    if (isPerfectSquare) {
      isCorrect = userAnswerNum === correctAnswer;
    } else {
      isCorrect = Math.abs(userAnswerNum - correctAnswer) <= tolerance;
    }

    const sqrtFormatted = correctAnswer.toFixed(2);
    setActualSqrtDisplay(
      `The square root of ${currentNumber} is ≈ ${sqrtFormatted}.`
    );

    if (isCorrect) {
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
    handleClearCanvas();
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]); // Add difficulty as a dependency

  useEffect(() => {
    localStorage.setItem("sqrtDifficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { top } = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - top - 20; // 20px buffer
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: Math.max(availableHeight, 150), // Ensure a minimum height
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const handleEnterPress = () => {
    if (!isAnswerChecked) {
      checkAnswer();
    } else {
      nextQuestion();
    }
  };

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
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
            <h3 className="text-2xl font-bold mb-4">
              How to Estimate Square Roots
            </h3>
            <p className="mb-2">
              To estimate the square root of a number (example: √57), find the
              two perfect squares it lies between.
            </p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>7 x 7 = 49</li>
              <li>8 x 8 = 64</li>
            </ul>
            <p className="mb-2">
              Since 57 is between 49 and 64, √57 must be between 7 and 8.
            </p>
            <p className="mb-2">To get a closer estimate:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>
                See which perfect square 57 is closer to: 57 is 8 away from 49,
                and 7 away from 64. It's slightly closer to 64, which means the
                answer is closer to 8 than 7.
              </li>
              <li>
                This means √57 should be a bit more than 7.5, perhaps around 7.5
                or 7.6.
              </li>
              <li>(Actual √57 ≈ 7.55)</li>
            </ul>
            <Button onClick={() => setShowHelpModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="text-3xl font-bold mb-6 text-center pt-10">
        {" "}
        {/* Added pt-10 for spacing below help/streak */}
        {currentNumber !== null && <span>Estimate: √{currentNumber} ≈ ?</span>}
      </div>

      {isAnswerChecked && actualSqrtDisplay && (
        <div className="text-xl text-center mb-4 font-semibold">
          {actualSqrtDisplay}
        </div>
      )}

      {feedback &&
        !isAnswerChecked && ( // Show feedback only before revealing the answer if it's just "Correct/Incorrect"
          <div
            className={`text-2xl font-semibold text-center mb-2 ${
              feedback.includes("Correct") ? "text-green-500" : "text-red-700"
            }`}
          >
            {feedback}
          </div>
        )}
      {feedback &&
        isAnswerChecked && ( // Show feedback alongside the actual answer
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
                // Allow changing answer to clear feedback if already checked
                setFeedback("");
                // setActualSqrtDisplay(''); // Optionally clear this too, or keep it
              } else {
                setFeedback("");
              }
            }}
            onEnterPress={handleEnterPress}
            placeholder="Enter your estimate"
            focusCounter={focusCounter}
            className="flex-grow p-2 text-xl border rounded" // Use flex-grow
            step="0.01" // Allow decimal input
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

      <div
        ref={containerRef}
        className="relative"
        style={{ width: "100%", height: `${canvasSize.height}px` }}
      >
        <Button
          onClick={handleClearCanvas}
          className="absolute top-2 right-2 z-10"
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
  );
}

export default App5;
