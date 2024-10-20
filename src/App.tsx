import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const generateQuestion = () => {
  const operations = ['+', '-'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  const num1 = Math.floor(Math.random() * 20) - 10;
  const num2 = Math.floor(Math.random() * 20) - 10;

  let displayNum1 = num1 < 0 ? `(${num1})` : num1;
  let displayNum2 = num2 < 0 ? `(${num2})` : num2;
  let displayOperation = operation;

  if (operation === '-' && Math.random() < 0.5) {
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

const playSound = (isCorrect: boolean) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (isCorrect) {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else {
    oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
    oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.1); // D4
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
};

const App = () => {
  const [question, setQuestion] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setUserAnswer(question.num1);
  }, [question]);

  const checkAnswer = () => {
    const correctAnswer = calculateAnswer(question.num1, question.num2, question.operation);
    const difference = Math.abs(userAnswer - correctAnswer);
    
    if (difference === 0) {
      setIsCorrect(true);
      setFeedback('Correct! Well done!');
      playSound(true);
    } else if (difference === 2) {
      setIsCorrect(false);
      setFeedback('Warm! Try again.');
      playSound(false);
    } else if (difference === 1) {
      setIsCorrect(false);
      setFeedback('Hot! Try again.');
      playSound(false);
    } else {
      setIsCorrect(false);
      setFeedback('Incorrect. Try again!');
      playSound(false);
    }
  };

  const nextQuestion = () => {
    const newQuestion = generateQuestion();
    setQuestion(newQuestion);
    setUserAnswer(newQuestion.num1);
    setFeedback('');
    setIsCorrect(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Integer Fun</h1>
      <div className="text-3xl font-bold mb-6 text-center">
        {question.displayNum1} {question.displayOperation} {question.displayNum2} = {userAnswer === question.num1 ? '?' : userAnswer}
      </div>
      <NumberLine min={-20} max={20} value={userAnswer} onChange={setUserAnswer} startNumber={question.num1} />
      <div className="flex justify-center space-x-4 mt-14">
        <Button onClick={checkAnswer} size="lg">Check Answer</Button>
        <Button onClick={nextQuestion} variant="outline" size="lg">Next Question</Button>
      </div>
      {feedback && (
        <div className={`mt-6 text-xl font-semibold text-center ${
          isCorrect ? 'text-green-500' : 'text-red-700'
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default App;
