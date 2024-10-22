import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import './App.css'

function App2() {
  const [question, setQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [isCheckDisabled, setIsCheckDisabled] = useState(false)
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      console.log('isThreeTerm', isThreeTerm)
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
              console.log('expression', expression)
              console.log('expression.split', expression.split(' '))
              console.log('expression.split[2]', expression.split(' ')[2])
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
    clearCanvas();
  }

  const calculateAnswer = (question: string): number => {
    // Replace ^ with ** for exponentiation
    const jsExpression = question.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
    // Use eval() for simplicity, but be cautious with it in production
    // You might want to implement a proper parser for security reasons
    return eval(jsExpression);
  }

  const checkAnswer = () => {
    const correctAnswer = calculateAnswer(question)
    if (parseFloat(userAnswer) === correctAnswer) {
      setFeedback('Correct! Well done! 🎉')
      setScore(score + 1)
      setIsCheckDisabled(true)
      setIsNextDisabled(false)
    } else {
      setFeedback(`Incorrect. Try again! 🔥`)
    }
  }

  const nextQuestion = () => {
    generateQuestion()
    setIsCheckDisabled(false)
    setIsNextDisabled(true)
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
    }
  };

  // Generate the first question when the component mounts
  useEffect(() => {
    nextQuestion()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight / 2; // Adjust as needed
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';

      let x, y;
      if ('touches' in e) {
        x = e.touches[0].clientX - canvas.offsetLeft;
        y = e.touches[0].clientY - canvas.offsetTop;
      } else {
        x = (e as MouseEvent).clientX - canvas.offsetLeft;
        y = (e as MouseEvent).clientY - canvas.offsetTop;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">PEDMAS Practice</h1>
      <p className="text-xl mb-4 text-center">Score: {score}</p>
      <div className="text-3xl font-bold mb-6 text-center">
        Solve: <span dangerouslySetInnerHTML={{ __html: formatQuestion(question) }} />
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Enter your answer"
        className="w-full p-2 mb-4 text-xl border rounded"
      />
      <div className="flex mt-12 justify-center space-x-4">
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
        {!isCheckDisabled && (
        <Button onClick={fillCorrectAnswer} size="lg">
            Fill Correct Answer
          </Button>
        )}
      </div>
      {feedback && (
        <div className={`mt-6 text-xl font-semibold text-center ${
          feedback.includes('Correct') ? 'text-green-500' : 'text-red-700'
        }`}>
          {feedback}
        </div>
      )}
      <button onClick={clearCanvas}>Clear Canvas</button>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        style={{ border: '1px solid black', touchAction: 'none' }}
      />
    </div>
  )
}

export default App2
