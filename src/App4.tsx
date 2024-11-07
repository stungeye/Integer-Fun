import { useState, useEffect } from "react";
import { playSound } from "@/utils/playSound";
import { Button } from "@/components/ui/button";

function App4() {
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentNumber, setCurrentNumber] = useState(0);
  const [currentLow, setCurrentLow] = useState(0);
  const [currentHigh, setCurrentHigh] = useState(0);

  const answer = (isCorrect: boolean) => {
    if (isAnswerChecked) return;

    if (isCorrect) {
      setScore(score + 1);
      setIsAnswerChecked(true);
      playSound(isCorrect);
      setFeedback("Correct! 🎉");
    } else {
      playSound(false);
      setScore(0);
      setFeedback("Incorrect. Try again.");
    }
  };

  const nextQuestion = () => {
    generateNumber(1000, 9999);
    setIsAnswerChecked(false);
    setUserInput("");
    setFeedback("");
  };

  const generateNumber = (min: number, max: number) => {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    setCurrentNumber(num);
    // floor to nearest 100
    setCurrentLow(Math.floor(num / 100) * 100);
    // ceil to nearest 100
    setCurrentHigh(Math.ceil(num / 100) * 100);
  };

  useEffect(() => {
    nextQuestion();
    setIsAnswerChecked(false);
    setUserInput("");
    setFeedback("");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative">
        <div className="absolute top-4 right-4 flex flex-row">
          <div className="bg-gray-100 p-2 rounded-md shadow inline-block">
            <p className="text-lg font-semibold">Streak: {score}</p>
          </div>
        </div>

        <div className="text-3xl font-bold mt-12 mb-6 text-center">
          <div className="mb-6">Estimation à la Centaine</div>
          <div>{currentNumber}</div>
          <div>
            <Button
              onClick={() => answer(currentNumber - currentLow <= 49)}
              size="lg"
              variant="outline"
            >
              {currentLow}
            </Button>
            <Button
              onClick={() => answer(currentHigh - currentNumber <= 50)}
              size="lg"
              variant="outline"
            >
              {currentHigh}
            </Button>
          </div>
          {feedback && (
            <div
              className={`text-3xl font-semibold mt-4 mb-4 ${
                feedback.includes("Correct") ? "text-green-500" : "text-red-700"
              }`}
            >
              {feedback}
            </div>
          )}
          {isAnswerChecked && (
            <Button onClick={nextQuestion} size="sm">
              Next
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4 mt-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl min-h-[60px] font-mono w-52 text-center">
              {userInput || " "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App4;
