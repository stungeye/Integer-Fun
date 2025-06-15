import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { playSound } from "@/utils/playSound";
import CustomInput from "@/components/CustomInput";

interface Equation {
  text: string;
  answer: number;
}

function App8() {
  const [currentEquation, setCurrentEquation] = useState<Equation | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [focusCounter, setFocusCounter] = useState(0);

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateEquation = (): Equation => {
    let equationText = "";
    let answer = 0;
    let xValue: number;

    do {
      xValue = getRandomInt(-20, 20);
    } while (xValue === 0 && Math.random() < 0.5);

    const termA = getRandomInt(1, 10);
    const termB = getRandomInt(-10, 10);
    let termC: number;

    const eqType = getRandomInt(1, 8);

    switch (eqType) {
      case 1:
        termC = termA * xValue + termB;
        equationText = `${termA}x + ${termB} = ${termC}`;
        answer = xValue;
        break;
      case 2:
        termC = termA * xValue - termB;
        if (termB < 0)
          equationText = `${termA}x + ${Math.abs(termB)} = ${termC}`;
        else equationText = `${termA}x - ${termB} = ${termC}`;
        answer = xValue;
        break;
      case 3:
        termC = termB - termA * xValue;
        equationText = `${termB} - ${termA}x = ${termC}`;
        answer = xValue;
        break;
      case 4:
        termC = termB + termA * xValue;
        equationText = `${termA}x + ${termB} = ${termC}`;
        answer = xValue;
        break;
      case 5:
        const denom5 = termA === 0 ? 1 : termA;
        if (!Number.isInteger(xValue / denom5)) {
          return generateEquation();
        }
        termC = xValue / denom5 + termB;
        equationText = `x/${denom5} + ${termB} = ${termC}`;
        answer = xValue;
        break;
      case 6:
        const denom6 = termA === 0 ? 1 : termA;
        if (!Number.isInteger(xValue / denom6)) {
          return generateEquation();
        }
        termC = xValue / denom6 - termB;
        if (termB < 0)
          equationText = `x/${denom6} + ${Math.abs(termB)} = ${termC}`;
        else equationText = `x/${denom6} - ${termB} = ${termC}`;
        answer = xValue;
        break;
      case 7:
        const denom7 = termA === 0 ? 1 : termA;
        if (!Number.isInteger(xValue / denom7)) {
          return generateEquation();
        }
        termC = termB - xValue / denom7;
        equationText = `${termB} - x/${denom7} = ${termC}`;
        answer = xValue;
        break;
      case 8:
        const denom8 = termA === 0 ? 1 : termA;
        if (!Number.isInteger(xValue / denom8)) {
          return generateEquation();
        }
        termC = termB + xValue / denom8;
        equationText = `x/${denom8} + ${termB} = ${termC}`;
        answer = xValue;
        break;
      default:
        return generateEquation();
    }

    equationText = equationText.replace(/\+ -/g, "- ");
    equationText = equationText.replace(/--/g, "+ ");
    equationText = equationText.replace(/(\s|^)1x/g, "$1x");

    if (
      (eqType <= 4 && termA === 1 && termB === 0) ||
      (eqType > 4 && termB === 0)
    ) {
      if (termA === 1 && termB === 0 && (eqType === 1 || eqType === 5)) {
        return generateEquation();
      }
    }

    if (!equationText.includes("x")) {
      return generateEquation();
    }

    return { text: equationText, answer };
  };

  const generateNewQuestion = () => {
    const newEquation = generateEquation();
    setCurrentEquation(newEquation);
    setUserAnswer("");
    setFeedback("");
    setIsAnswerChecked(false);
    setFocusCounter((prev) => prev + 1);
  };

  const checkAnswer = () => {
    if (userAnswer === "" || currentEquation === null) {
      setFocusCounter((prev) => prev + 1);
      return;
    }

    const userAnswerNum = parseInt(userAnswer, 10);

    if (isNaN(userAnswerNum)) {
      setFeedback("Please enter a valid integer. 🔥");
      playSound(false);
      setIsAnswerChecked(true);
      return;
    }

    const correctAnswer = currentEquation.answer;
    const isCorrect = userAnswerNum === correctAnswer;

    if (isCorrect) {
      setFeedback("Correct! 🎉");
      setScore(score + 1);
      playSound(true);
      handleClearCanvas(); // Auto-clear canvas on correct answer
    } else {
      setScore(0);
      setFeedback(`Incorrect. The answer is ${correctAnswer}. 🔥`);
      playSound(false);
    }
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    generateNewQuestion();
    handleClearCanvas();
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { top } = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - top - 20;
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: Math.max(availableHeight, 150),
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

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
            <h3 className="text-2xl font-bold mb-4">
              How to Solve Simple Algebra Equations
            </h3>
            <p className="mb-2">
              The goal is to find the value of 'x'. To do this, you need to
              isolate 'x' on one side of the equation.
            </p>
            <p className="font-semibold mt-3 mb-1">Key Principles:</p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li>
                <strong>Balance:</strong> Whatever you do to one side of the
                equation, you must do to the other.
              </li>
              <li>
                <strong>Inverse Operations:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Addition undoes subtraction (and vice-versa).</li>
                  <li>Multiplication undoes division (and vice-versa).</li>
                </ul>
              </li>
            </ul>
            <p className="font-semibold mt-3 mb-1">
              Example: Solve for x in <code>2x + 3 = 7</code>
            </p>
            <ol className="list-decimal list-inside mb-2 space-y-1">
              <li>
                Subtract 3 from both sides: <code>2x + 3 - 3 = 7 - 3</code> ➔{" "}
                <code>2x = 4</code>
              </li>
              <li>
                Divide both sides by 2: <code>2x / 2 = 4 / 2</code> ➔{" "}
                <code>x = 2</code>
              </li>
            </ol>
            <p className="font-semibold mt-3 mb-1">
              Example: Solve for x in <code>x/3 - 5 = 1</code>
            </p>
            <ol className="list-decimal list-inside mb-4 space-y-1">
              <li>
                Add 5 to both sides: <code>x/3 - 5 + 5 = 1 + 5</code> ➔{" "}
                <code>x/3 = 6</code>
              </li>
              <li>
                Multiply both sides by 3: <code>(x/3) * 3 = 6 * 3</code> ➔{" "}
                <code>x = 18</code>
              </li>
            </ol>
            <Button onClick={() => setShowHelpModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="text-3xl font-bold mb-6 text-center pt-10">
        {currentEquation && <span>Solve for x: {currentEquation.text}</span>}
      </div>

      {isAnswerChecked && feedback && (
        <div
          className={`text-2xl font-semibold text-center mb-2 ${
            feedback.includes("Correct") ? "text-green-500" : "text-red-700"
          }`}
        >
          {feedback}
        </div>
      )}
      {!isAnswerChecked && feedback && (
        <div className="text-2xl font-semibold text-center mb-2 text-red-700">
          {feedback}
        </div>
      )}

      <div className="flex flex-col items-center space-y-4 mt-4 mb-4">
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <CustomInput
            type="number"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              if (isAnswerChecked) {
                setFeedback("");
              } else {
                setFeedback("");
              }
            }}
            onEnterPress={handleEnterPress}
            placeholder="Enter x"
            focusCounter={focusCounter}
            className="flex-grow p-2 text-xl border rounded"
          />
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

export default App8;
