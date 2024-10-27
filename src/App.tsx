import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { playSound } from '@/utils/playSound';
import NumberLine from '@/components/NumberLine';

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

const App = () => {
  const initialQuestion = generateQuestion();
  const [question, setQuestion] = useState(initialQuestion);
  const [userAnswer, setUserAnswer] = useState(initialQuestion.num1);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const checkAnswer = () => {
    const correctAnswer = calculateAnswer(question.num1, question.num2, question.operation);
    const difference = Math.abs(userAnswer - correctAnswer);
    
    if (difference === 0) {
      setIsCorrect(true);
      setFeedback('Correct! Well done!');
      setStreak(prevStreak => prevStreak + 1);
      setIsAnswerChecked(true);
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
    setUserAnswer(newQuestion.num1);  // Set initial user answer to num1
    setFeedback('');
    setIsCorrect(false);
    setIsAnswerChecked(false);
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
        {!isAnswerChecked && <Button onClick={checkAnswer} size="lg">Check Answer</Button>}
        {isAnswerChecked && <Button onClick={nextQuestion} size="lg">Next Question</Button>}
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
