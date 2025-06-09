import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { playSound } from "@/utils/playSound";
import CustomInput from "@/components/CustomInput";

type ProblemType = "Perimeter" | "Area" | "Volume";
type Difficulty = "Easy" | "Medium" | "Hard";

interface ShapeProblem {
  problemType: ProblemType;
  dimensions: { l?: number; w?: number; h?: number };
  shape: "Rectangle" | "Box";
  questionText: string;
  correctAnswer: number;
  unit: string; // e.g., units, square units, cubic units
}

function App7() {
  const [problem, setProblem] = useState<ShapeProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [actualAnswerDisplay, setActualAnswerDisplay] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem("geometryDifficulty");
    return (savedDifficulty as Difficulty) || "Medium";
  });
  const [showHelpModal, setShowHelpModal] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [focusCounter, setFocusCounter] = useState(0);

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  const generateQuestion = () => {
    let newProblem: ShapeProblem;
    const problemTypes: ProblemType[] = ["Perimeter", "Area", "Volume"];
    const selectedType =
      problemTypes[Math.floor(Math.random() * problemTypes.length)];

    let minSide = 2,
      maxSide2D = 10,
      maxSide3D = 7; // Medium defaults

    switch (difficulty) {
      case "Easy":
        minSide = 2;
        maxSide2D = 6;
        maxSide3D = 4;
        break;
      case "Hard":
        minSide = 5;
        maxSide2D = 15;
        maxSide3D = 10;
        break;
      // Medium is default
    }

    const randSide = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (selectedType === "Perimeter" || selectedType === "Area") {
      const l = randSide(minSide, maxSide2D);
      const w = randSide(minSide, maxSide2D);
      let answer = 0;
      let qText = "";
      let unit = "units";
      if (selectedType === "Perimeter") {
        answer = 2 * (l + w);
        qText = `Calculate the perimeter of a rectangle with sides ${l} and ${w}.`;
      } else {
        // Area
        answer = l * w;
        qText = `Calculate the area of a rectangle with sides ${l} and ${w}.`;
        unit = "square units";
      }
      newProblem = {
        problemType: selectedType,
        dimensions: { l, w },
        shape: "Rectangle",
        questionText: qText,
        correctAnswer: answer,
        unit: unit,
      };
    } else {
      // Volume
      const l = randSide(minSide, maxSide3D);
      const w = randSide(minSide, maxSide3D);
      const h = randSide(minSide, maxSide3D);
      const answer = l * w * h;
      newProblem = {
        problemType: "Volume",
        dimensions: { l, w, h },
        shape: "Box",
        questionText: `Calculate the volume of a box with dimensions ${l}, ${w}, and ${h}.`,
        correctAnswer: answer,
        unit: "cubic units",
      };
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
    const userAnswerNum = parseInt(userAnswer, 10);
    const { correctAnswer, problemType, unit } = problem;

    if (userAnswerNum === correctAnswer) {
      setFeedback("Correct! 🎉");
      setScore(score + 1);
      playSound(true);
    } else {
      setScore(0);
      setFeedback("Incorrect. 🔥");
      playSound(false);
    }
    setActualAnswerDisplay(
      `The correct ${problemType.toLowerCase()} is ${correctAnswer} ${unit}.`
    );
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem("geometryDifficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { top, width } = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - top - 20;
        setCanvasSize({
          width: width,
          height: Math.max(availableHeight, 170), // Align min height with SVG side
        });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [problem]);

  const handleEnterPress = () => {
    if (!isAnswerChecked) {
      checkAnswer();
    } else {
      nextQuestion();
    }
  };

  // Basic SVG rendering for shapes - can be enhanced
  const renderShape = () => {
    if (!problem) return null;
    const { shape, dimensions } = problem;
    const svgBaseWidth = 200;
    let svgBaseHeight = 150; // Default for rectangle
    const padding = 20; // Universal padding

    if (shape === "Rectangle" && dimensions.l && dimensions.w) {
      const availableWidthForRect = svgBaseWidth - 2 * padding;
      const availableHeightForRect = svgBaseHeight - 2 * padding;

      let finalScale = 1;
      // Prevent division by zero if dimensions are 0, though problem gen should avoid this.
      const scaleToFitL =
        dimensions.l > 0 ? availableWidthForRect / dimensions.l : 1;
      const scaleToFitW =
        dimensions.w > 0 ? availableHeightForRect / dimensions.w : 1;
      finalScale = Math.min(scaleToFitL, scaleToFitW);
      finalScale = Math.max(finalScale, 0.1); // Prevent overly tiny shapes if one dim is huge

      const displayL = dimensions.l * finalScale;
      const displayW = dimensions.w * finalScale;

      const xRectStart = padding + (availableWidthForRect - displayL) / 2;
      const yRectStart = padding + (availableHeightForRect - displayW) / 2;

      return (
        <svg
          width={svgBaseWidth}
          height={svgBaseHeight}
          viewBox={`0 0 ${svgBaseWidth} ${svgBaseHeight}`}
        >
          <rect
            x={xRectStart}
            y={yRectStart}
            width={displayL}
            height={displayW}
            className="fill-blue-100 stroke-blue-500 stroke-2"
          />
          <text
            x={xRectStart + displayL / 2}
            y={yRectStart - 5} // Position 5px above the rectangle
            textAnchor="middle"
            dominantBaseline="alphabetic" // Baseline for typical text rendering
            className="text-sm fill-black"
          >
            {dimensions.l}
          </text>
          <text
            x={xRectStart - 5} // Position 5px left of the rectangle
            y={yRectStart + displayW / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-sm fill-black"
          >
            {dimensions.w}
          </text>
        </svg>
      );
    }
    if (shape === "Box" && dimensions.l && dimensions.w && dimensions.h) {
      svgBaseHeight = 170; // Adjusted base height for box
      const perspectiveFactor = 0.4;
      // const padding = 20; // Defined above

      // Full drawable area within padding
      const drawableWidth = svgBaseWidth - 2 * padding;
      const drawableHeight = svgBaseHeight - 2 * padding;

      // Target rendering area for the box (e.g., 70% of drawable area)
      const targetBoxRenderPercent = 0.7;
      const targetBoxRenderWidth = drawableWidth * targetBoxRenderPercent;
      const targetBoxRenderHeight = drawableHeight * targetBoxRenderPercent;

      const unscaledPerspectiveDepthX = dimensions.l * perspectiveFactor;
      const unscaledPerspectiveDepthY = dimensions.l * perspectiveFactor * 0.5;

      // Overall unscaled dimensions of the box drawing including perspective
      const unscaledDrawingWidth = dimensions.w + unscaledPerspectiveDepthX;
      const unscaledDrawingHeight = dimensions.h + unscaledPerspectiveDepthY;

      let finalScale = 1;
      if (unscaledDrawingWidth > 0 && targetBoxRenderWidth > 0) {
        const scaleX = targetBoxRenderWidth / unscaledDrawingWidth;
        if (unscaledDrawingHeight > 0 && targetBoxRenderHeight > 0) {
          const scaleY = targetBoxRenderHeight / unscaledDrawingHeight;
          finalScale = Math.min(scaleX, scaleY);
        } else {
          finalScale = scaleX;
        }
      } else if (unscaledDrawingHeight > 0 && targetBoxRenderHeight > 0) {
        finalScale = targetBoxRenderHeight / unscaledDrawingHeight;
      } else {
        finalScale = 0.1; // Fallback for zero dimensions
      }
      finalScale = Math.max(finalScale, 0.05); // Prevent extremely tiny or zero scale

      const scaledFrontW = dimensions.w * finalScale;
      const scaledFrontH = dimensions.h * finalScale;
      const depthShiftX = dimensions.l * finalScale * perspectiveFactor; // Use original L for perspective base
      const depthShiftY = dimensions.l * finalScale * perspectiveFactor * 0.5;

      const totalScaledDrawingWidth = scaledFrontW + depthShiftX;
      const totalScaledDrawingHeight = scaledFrontH + depthShiftY;

      // Center the scaled box within the *full* drawable area (not the 70% target area)
      const drawingContainerX =
        padding + (drawableWidth - totalScaledDrawingWidth) / 2;
      const drawingContainerY =
        padding + (drawableHeight - totalScaledDrawingHeight) / 2;

      const xFront = drawingContainerX;
      const yFront = drawingContainerY + depthShiftY;

      const xBack = xFront + depthShiftX;
      const yBack = yFront - depthShiftY;

      return (
        <svg
          width={svgBaseWidth}
          height={svgBaseHeight}
          viewBox={`0 0 ${svgBaseWidth} ${svgBaseHeight}`}
        >
          {/* Back Face */}
          <polygon
            points={`${xBack},${yBack} ${xBack + scaledFrontW},${yBack} ${
              xBack + scaledFrontW
            },${yBack + scaledFrontH} ${xBack},${yBack + scaledFrontH}`}
            className="fill-gray-200 stroke-gray-400 stroke-1"
          />
          {/* Left Side Face */}
          <polygon
            points={`${xFront},${yFront} ${xBack},${yBack} ${xBack},${
              yBack + scaledFrontH
            } ${xFront},${yFront + scaledFrontH}`}
            className="fill-gray-300 stroke-gray-500 stroke-1"
          />
          {/* Right Side Face */}
          <polygon
            points={`${xFront + scaledFrontW},${yFront} ${
              xBack + scaledFrontW
            },${yBack} ${xBack + scaledFrontW},${yBack + scaledFrontH} ${
              xFront + scaledFrontW
            },${yFront + scaledFrontH}`}
            className="fill-gray-300 stroke-gray-500 stroke-1"
          />
          {/* Top Face */}
          <polygon
            points={`${xFront},${yFront} ${xBack},${yBack} ${
              xBack + scaledFrontW
            },${yBack} ${xFront + scaledFrontW},${yFront}`}
            className="fill-gray-100 stroke-gray-400 stroke-1"
          />
          {/* Front Face */}
          <rect
            x={xFront}
            y={yFront}
            width={scaledFrontW}
            height={scaledFrontH}
            className="fill-blue-200 stroke-blue-600 stroke-2"
          />
          {/* Labels - using original dimensions */}
          {/* Width (dimensions.w) - bottom of front face */}
          <text
            x={xFront + scaledFrontW / 2}
            y={yFront + scaledFrontH + 12}
            textAnchor="middle"
            className="text-xs fill-black"
          >
            {dimensions.w}
          </text>
          {/* Height (dimensions.h) - rightmost vertical edge */}
          <text
            x={xFront + scaledFrontW + depthShiftX + 5}
            y={yFront - depthShiftY + scaledFrontH / 2}
            textAnchor="start"
            dominantBaseline="middle"
            className="text-xs fill-black"
          >
            {dimensions.h}
          </text>
          {/* Length/Depth (dimensions.l) - bottom-right receding edge */}
          <text
            x={(xFront + scaledFrontW + xBack + scaledFrontW) / 2}
            y={(yFront + scaledFrontH + yBack + scaledFrontH) / 2 + 10} // Adjusted y for bottom edge + offset
            textAnchor="middle"
            dominantBaseline="hanging" // Adjusted for positioning below the line
            className="text-xs fill-black"
          >
            {dimensions.l}
          </text>
        </svg>
      );
    }
    return null;
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
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
            <h3 className="text-2xl font-bold mb-4">Geometry Formulas</h3>
            <h4 className="text-lg font-semibold mt-3 mb-1">Rectangle:</h4>
            <ul className="list-disc list-inside mb-2 pl-4">
              <li>Perimeter = 2 × (length + width)</li>
              <li>Area = length × width</li>
            </ul>
            <h4 className="text-lg font-semibold mt-3 mb-1">
              Rectangular Prism (Box):
            </h4>
            <ul className="list-disc list-inside mb-4 pl-4">
              <li>Volume = length × width × height</li>
            </ul>
            <Button onClick={() => setShowHelpModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="text-xl font-bold mb-1 text-center pt-10">
        {problem?.questionText}
      </div>

      {isAnswerChecked && actualAnswerDisplay && (
        <div className="text-xl text-center mb-4 font-semibold">
          {actualAnswerDisplay}
        </div>
      )}

      {feedback && (
        <div
          className={`mt-2 p-2 text-center rounded ${
            feedback.startsWith("Correct")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Moved Input, Difficulty Selector, and Action Button Block */}
      <div className="flex flex-col items-center space-y-4 my-4">
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
            placeholder={`Enter ${problem?.problemType.toLowerCase()} (${
              problem?.unit
            })`}
            focusCounter={focusCounter}
            className="flex-grow p-2 text-xl border rounded"
            step="1"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="p-2 text-xl border rounded bg-white h-full"
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

      <div className="flex flex-row items-start space-x-4 my-4">
        {/* SVG Shape on the left */}
        <div className="flex-shrink-0 w-[200px] h-[170px] border rounded bg-slate-50 flex items-center justify-center">
          {renderShape()}
        </div>

        {/* Drawing Canvas on the right */}
        <div
          ref={containerRef}
          className="relative flex-grow h-[170px]" // Initial height, JS will adjust
          style={{ height: `${canvasSize.height}px` }} // Controlled by state
        >
          <Button
            onClick={handleClearCanvas}
            className="absolute top-1 right-1 z-10"
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

export default App7;
