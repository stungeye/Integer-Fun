import React, { useState } from 'react'

function App3() {
  const [score, setScore] = useState(0)

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Spelling Game</h2>
      <p className="mb-4">Score: {score}</p>
      {/* Game content will be added here */}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => {/* Start game logic will be added here */}}
      >
        Start Game
      </button>
    </div>
  )
}

export default App3

