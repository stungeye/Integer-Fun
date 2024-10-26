import React, { useState, useEffect, useRef } from 'react'
import { playSound } from '@/utils/playSound'
import { Button } from '@/components/ui/button'
import { WordList, wordLists } from '@/data/wordLists'

function App3() {
  const [score, setScore] = useState(0)
  const [isCheckDisabled, setIsCheckDisabled] = useState(false)
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [currentWordList, setCurrentWordList] = useState<WordList>(wordLists[0])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [userInput, setUserInput] = useState('')
  const [voice, setVoice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const checkAnswer = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase()
    
    if (isCorrect) {
      setScore(score + 1)
      setIsCheckDisabled(true)
      setIsNextDisabled(false)
      playSound(isCorrect)
      setFeedback('Correct! 🎉')
    } else {
      playSound(false)
      setScore(0)
      setFeedback('Incorrect. Try again.')
    }
  }

  const nextQuestion = () => {
    if (currentWordList) {
      const nextIndex = (currentWordIndex + 1) % currentWordList.words.length
      setCurrentWordIndex(nextIndex)
      setCurrentWord(currentWordList.words[nextIndex])
      console.log("Next word:", currentWordList.words[nextIndex])
      setFeedback('')
      setIsCheckDisabled(false)
      setIsNextDisabled(true)
      setUserInput('')
      focusInput()
      speakWord(currentWordList.words[nextIndex])
    }
  }

  const speakWord = (word: string) => {
    if (currentWordList && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = currentWordList.language
      console.log("Speaking word:", word, "in language:", currentWordList.language)

      // Get available voices
      const voices = window.speechSynthesis.getVoices()
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

      // Find a voice that matches the language
      const voice = voices.find(v => v.lang.includes(currentWordList.language))
      if (voice) {
        utterance.voice = voice
        console.log("Voice found:", voice)
      }

      setVoice(utterance.voice?.name || 'none found')
      // Adjust pitch and rate for better pronunciation
      utterance.pitch = 1
      utterance.rate = 0.8

      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    setCurrentWordIndex(0)
    setCurrentWord(currentWordList.words[0])
    setFeedback('')
    setIsCheckDisabled(false)
    setIsNextDisabled(true)
    setUserInput('')
    focusInput()
  }, [currentWordList])

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }

    loadVoices()
    
    // Some browsers need a little time to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const handleWordListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedList = wordLists.find(list => list.name === event.target.value);
    if (selectedList) {
      setCurrentWordList(selectedList);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative">
      <div className="absolute top-4 left-4">
        <select
          value={currentWordList.name}
          onChange={handleWordListChange}
          className="bg-gray-100 p-2 rounded-md shadow"
        >
          {wordLists.map((list: WordList) => (
            <option key={list.name} value={list.name}>
              {list.name}
            </option>
          ))}
        </select>
      </div>

      <div className="absolute top-4 right-4">
        <div className="bg-gray-100 p-2 rounded-md shadow inline-block">
          <p className="text-lg font-semibold">Streak: {score}</p>
        </div>
      </div>

      <div className="text-3xl font-bold mb-6 text-center">
        {currentWordList && (
          <p>Spell the word: <Button onClick={() => speakWord(currentWord)}>🔊 Listen</Button></p>
        )}
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
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
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
        <p>Voice: {voice}</p>
      </div>
    </div>
  )
}

export default App3
