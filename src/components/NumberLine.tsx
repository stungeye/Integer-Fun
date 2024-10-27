import React, { useCallback } from 'react';

interface NumberLineProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  startNumber: number;
}

const NumberLine: React.FC<NumberLineProps> = ({ min, max, value, onChange, startNumber }) => {
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

export default NumberLine;
