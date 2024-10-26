import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas'
import { playSound } from '@/utils/playSound'

function App2() {
  const [question, setQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [isCheckDisabled, setIsCheckDisabled] = useState(false)
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const canvasRef = useRef<DrawingCanvasRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  }

  const generateQuestion = () => {
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomOperator = (includeExponent: boolean): string => {
      const operators = includeExponent ? ['+', '-', '*', '/', '^'] : ['+', '-', '*', '/'];
      return operators[Math.floor(Math.random() * operators.length)];
    };

    const generateTerm = (): string => {
      const isNegative = Math.random() < 0.5;
      // Pick num randomly from this collection [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10]
      const nums = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10];
      const num = nums[Math.floor(Math.random() * nums.length)];
      return isNegative ? `(-${num})` : num.toString();
    };

    const generateExpression = (): string => {
      // Determine if we're generating a two-term or three-term expression
      const isThreeTerm = Math.random() < 0.8; // 50% chance for three-term expressions
      const op1 = getRandomOperator(true);
      if (op1 === '^') {
        const base = getRandomInt(2, 6);
        let exponent;
        if (base === 2 || base === 3) {
          exponent = Math.random() < 0.5 ? 2 : 3;
        } else {
          exponent = 2;
        }
        return `${base}^${exponent}`;
      } else if (op1 === '/') {
        const divisor = getRandomInt(2, 5);
        const quotient = getRandomInt(1, 5);
        const dividend = divisor * quotient;
        return `${dividend} / ${divisor}`;
      } else {
        let expression = `${generateTerm()} ${op1} ${generateTerm()}`;
        // If it's a three-term expression, add another operator and term
        if (isThreeTerm) {
          const op2 = getRandomOperator(false);
          if (op2 === '/') {
            let divisorSource: number;
            if (op1 === '*' || op1 === '^' || op1 === '/') {
              divisorSource = Math.abs(Math.round(calculateAnswer(expression)));
            } else {
              divisorSource = Math.abs(parseInt(eval(expression.split(' ')[2])));
            }
            const factors = getEvenFactors(divisorSource);
            const divisor = factors[Math.floor(Math.random() * factors.length)];
            expression += ` / ${divisor}`;
          } else {
            expression += ` ${op2} ${generateTerm()}`;
          }
        }
        
        return expression;
      }
    };

    const expression = generateExpression();
    setQuestion(expression);
    setCorrectAnswer(calculateAnswer(expression));
    setUserAnswer('');
    setFeedback('');
    setIsCheckDisabled(false);
    setIsNextDisabled(true);
  }

  const calculateAnswer = (question: string): number => {
    // Replace ^ with ** for exponentiation
    const jsExpression = question.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
    // Use eval() for simplicity, but be cautious with it in production
    // You might want to implement a proper parser for security reasons
    return eval(jsExpression);
  }

  const checkAnswer = () => {
    if (userAnswer === '') {
      focusInput();
      return;
    }

    const correctAnswer = calculateAnswer(question)
    if (parseFloat(userAnswer) === correctAnswer) {
      setFeedback('Correct! 🎉')
      setScore(score + 1)
      setIsCheckDisabled(true)
      setIsNextDisabled(false)
      playSound(true);
    } else {
      setScore(0);
      setFeedback('Incorrect. 🔥')
      playSound(false);
    }
  }

  const nextQuestion = () => {
    generateQuestion()
    handleClearCanvas()
    setIsCheckDisabled(false)
    setIsNextDisabled(true)
    focusInput(); // Focus the input after generating a new question
  }

  const formatQuestion = (question: string): string => {
    return question
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
  }

  const getEvenFactors = (num: number): number[] => {
    const factors: number[] = [];
    for (let i = 2; i <= num; i++) {
      if (num % i === 0) factors.push(i);
    }
    // Is factors is empty, return [1, num]
    if (factors.length === 0) {
      return [1, num];
    }
    
    return factors;
  };

  const fillCorrectAnswer = () => {
    if (correctAnswer !== null) {
      setScore(0);
      setUserAnswer(correctAnswer.toString());
      setFeedback('')
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isCheckDisabled) {
        checkAnswer();
      }
      if (!isNextDisabled) {
        nextQuestion();
      }
    }
  };

  // Generate the first question when the component mounts
  useEffect(() => {
    nextQuestion();
    focusInput(); // Focus the input when the component mounts
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { top } = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - top;
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: Math.max(availableHeight, 150) // Ensure a minimum height of 150px
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative">
      <div className="absolute top-4 right-4 flex flex-row">
        {!isCheckDisabled && feedback.includes('Incorrect') && (
          <Button onClick={fillCorrectAnswer} size="lg" variant="destructive" className="inline-block mr-4">
            Show Answer
          </Button>
        )}

        <div className="bg-gray-100 p-2 rounded-md shadow inline-block">
          <p className="text-lg font-semibold">Streak: {score}</p>
        </div>
      </div>

      <div className="text-3xl font-bold mb-6 text-center">
        <span dangerouslySetInnerHTML={{ __html: formatQuestion(question) }} /> = {userAnswer ? userAnswer : '?'}
        {feedback && (
          <div className={`text-3xl font-semibold inline-block ml-4 ${
            feedback.includes('Correct') ? 'text-green-500' : 'text-red-700'
          }`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4 mt-4 mb-4">
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => { setUserAnswer(e.target.value); setFeedback('') }}
          onKeyDown={handleKeyPress}
          placeholder="Enter your answer"
          className="w-full max-w-md p-2 text-xl border rounded"
        />

        <div className="flex space-x-4">
          {!isCheckDisabled && (
            <Button onClick={checkAnswer} size="lg">
              Check Answer
            </Button>
          )}
          {!isNextDisabled && (
            <Button onClick={nextQuestion} size="lg">
              Next Question
            </Button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative" style={{ width: '100%', height: `${canvasSize.height}px` }}>
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
  )
}

export default App2
