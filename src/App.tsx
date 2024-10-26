import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { playSound } from '@/utils/playSound';

const generateQuestion = () => {
  const operations = ['+', '-'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  const num1 = Math.floor(Math.random() * 20) - 10;
  const num2 = Math.floor(Math.random() * 20) - 10;

  let displayNum1 = num1 < 0 ? `(${num1})` : num1;
  let displayNum2 = num2 < 0 ? `(${num2})` : num2;
  let displayOperation = operation;

  if (operation === '-' && num2 > 0 && Math.random() < 0.5) {
    displayOperation = '+';
    displayNum2 = `(${-num2})`;
  }

  return { 
    num1, 
    num2, 
    operation, 
    displayNum1, 
    displayNum2, 
    displayOperation 
  };
};

const calculateAnswer = (num1: number, num2: number, operation: string) => {
  return operation === '+' ? num1 + num2 : num1 - num2;
};

const NumberLine = ({ min, max, value, onChange, startNumber }: { min: number, max: number, value: number, onChange: (value: number) => void, startNumber: number }) => {
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newValue = Math.round(min + (max - min) * percentage);
    onChange(newValue);
  }, [min, max, onChange]);

  const getPositionPercentage = (num: number) => ((num - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-16 bg-white border-b-2 border-gray-300 my-6" onClick={handleClick}>
      {Array.from({ length: max - min + 1 }, (_, i) => {
        const currentNumber = min + i;
        const isStartNumber = currentNumber === startNumber;
        const isSelected = currentNumber === value;
        return (
          <React.Fragment key={i}>
            <div className={`absolute bottom-0 transform -translate-x-1/2 ${
              isStartNumber ? 'h-8 w-1.5 bg-green-500' : 
              isSelected ? 'h-8 w-1.5 bg-blue-500' : 'h-4 w-0.5 bg-gray-400'
            }`} 
                 style={{ left: `${getPositionPercentage(currentNumber)}%` }}></div>
            <div className={`absolute top-full mt-2 transform -translate-x-1/2 text-sm ${
              isStartNumber ? 'font-bold text-green-600' : 
              isSelected ? 'font-bold text-blue-600' : ''
            }`} 
                 style={{ left: `${getPositionPercentage(currentNumber)}%` }}>
              {currentNumber}
            </div>
          </React.Fragment>
        );
      })}
      <div className="absolute top-0 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full transition-all duration-200 ease-in-out"
           style={{ left: `${getPositionPercentage(value)}%` }}></div>
    </div>
  );
};

const App = () => {
  const [question, setQuestion] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [isCheckDisabled, setIsCheckDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(true);  // New state for Next Question button

  useEffect(() => {
    setUserAnswer(question.num1);
  }, [question]);

  const checkAnswer = () => {
    const correctAnswer = calculateAnswer(question.num1, question.num2, question.operation);
    const difference = Math.abs(userAnswer - correctAnswer);
    
    if (difference === 0) {
      setIsCorrect(true);
      setFeedback('Correct! Well done!');
      setStreak(prevStreak => prevStreak + 1);
      setIsCheckDisabled(true);
      setIsNextDisabled(false);  // Enable the Next Question button
      playSound(true);
    } else if (difference === 2) {
      setIsCorrect(false);
      setFeedback('Warm! Try again.');
      setStreak(0);  // Reset streak
      playSound(false);
    } else if (difference === 1) {
      setIsCorrect(false);
      setFeedback('Hot! Try again.');
      setStreak(0);  // Reset streak
      playSound(false);
    } else {
      setIsCorrect(false);
      setFeedback('Incorrect. Try again!');
      setStreak(0);  // Reset streak
      playSound(false);
    }
  };

  const nextQuestion = () => {
    const newQuestion = generateQuestion();
    setQuestion(newQuestion);
    setUserAnswer(newQuestion.num1);
    setFeedback('');
    setIsCorrect(null);
    setIsCheckDisabled(false);
    setIsNextDisabled(true);  // Disable the Next Question button again
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative">
      <div className="absolute top-4 right-4">
        <div className="bg-gray-100 p-2 rounded-md shadow">
          <p className="text-lg font-semibold">Streak: {streak}</p>
        </div>
      </div>

      <div className="text-3xl font-bold mb-6 text-center">
        {question.displayNum1} {question.displayOperation} {question.displayNum2} = {userAnswer === question.num1 ? '?' : userAnswer}
      </div>
      <NumberLine min={-20} max={20} value={userAnswer} onChange={setUserAnswer} startNumber={question.num1} />
      <div className="flex mt-12 justify-center space-x-4">
        {!isCheckDisabled && <Button onClick={checkAnswer} size="lg" disabled={isCheckDisabled}>Check Answer</Button>}
        {!isNextDisabled && <Button onClick={nextQuestion} size="lg" disabled={isNextDisabled}>Next Question</Button>}
      </div>
      {feedback && (
        <div className={`mt-6 text-xl font-semibold text-center ${
          isCorrect ? 'text-green-500' : 'text-red-700'
        }`}>
          {feedback} {isCorrect ? '🎉' : '🔥'}
        </div>
      )}
    </div>
  );
};

export default App;
