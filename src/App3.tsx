import React, { useState, useEffect } from 'react'
import { playSound } from '@/utils/playSound'
import { Button } from '@/components/ui/button'
import { WordList, wordLists } from '@/data/wordLists'
import { OnScreenKeyboard } from './components/OnScreenKeyboard'

function App3() {
  const [score, setScore] = useState(0)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [currentWordList, setCurrentWordList] = useState<WordList>(wordLists[0])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [userInput, setUserInput] = useState('')
  const isIosSafari = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const checkAnswer = () => {
    if (userInput.trim() === '') {
      return;
    }

    const isCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase()
    
    if (isCorrect) {
      setScore(score + 1)
      setIsAnswerChecked(true)
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
      setIsAnswerChecked(false)
      setUserInput('')
      setFeedback('')
      speakWord(currentWordList.words[nextIndex])
    }
  }

  const speakWord = (word: string, rate: number = 0.75) => {
    if (currentWordList && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = currentWordList.language
      const voices = window.speechSynthesis.getVoices()

      let voice = voices.find(v => v.name === 'Amélie' && v.lang.includes(currentWordList.language))
      if (!voice) {
        // If no Amelie voice is found, find a voice that matches the language
        voice = voices.find(v => v.lang.includes(currentWordList.language))
      }
      if (voice) {
        utterance.voice = voice
      }

      utterance.rate = rate
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  const fillCorrectAnswer = () => {
    if (currentWord !== null) {
      setScore(0);
      setUserInput(currentWord);
      setFeedback('')
    }
  };

  const handleEnterPress = () => {
    if (!isAnswerChecked) {
      if (userInput.trim() === '') {
        speakWord(currentWord)
      } else {
        checkAnswer();
      }
    } else {
      nextQuestion();
    }
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * currentWordList.words.length)
    setCurrentWordIndex(randomIndex)
    setCurrentWord(currentWordList.words[randomIndex])
    setIsAnswerChecked(false)
    setUserInput('')
    setFeedback('')
  }, [currentWordList])

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }

    loadVoices()
    
    // Some browsers need a little time to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const handleWordListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedList = wordLists.find(list => list.name === event.target.value);
    if (selectedList) {
      setCurrentWordList(selectedList);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      handleEnterPress();
      return;
    }

    if (isAnswerChecked) return;

    if (key === 'Backspace') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + key);
    }

    setFeedback('');
  };

  const clearInput = () => {
    setUserInput('');
    setFeedback('');
  };

  const getHint = () => {
    return currentWord.split('').map(() => '_').join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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

        <div className="absolute top-4 right-4 flex flex-row">
          {!isAnswerChecked && feedback.includes('Incorrect') && (
            <Button onClick={fillCorrectAnswer} size="lg" variant="destructive" className="inline-block mr-4">
              Show Answer
            </Button>
          )}

          <div className={`${score >= currentWordList.words.length ? 'bg-green-500' : 'bg-gray-100'} p-2 rounded-md shadow inline-block`}>
            <p className="text-lg font-semibold">Streak: {score}</p>
          </div>
        </div>

        <div className="text-3xl font-bold mt-12 mb-6 text-center">
          {currentWordList && (
            <>
              <Button onClick={() => { speakWord(currentWord); setFeedback('') }}>🔊 Listen</Button> &nbsp; 
              <Button onClick={() => { speakWord(currentWord, isIosSafari ? 0.5 : 0.3); setFeedback('') }}>🔊 Slow</Button>
            </>
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
          <div className="flex items-center gap-4">
            <div className="text-4xl min-h-[60px] font-mono w-52 text-center">
              {userInput || ' '}
            </div>
            <Button 
              onClick={clearInput}
              size="sm"
              variant="outline"
            >
              Clear
            </Button>
            <Button 
              onClick={() => setFeedback(getHint())}
              size="sm"
              variant="outline"
            >
              Hint
            </Button>
          </div>
          
          <div className="flex space-x-4">
            {!isAnswerChecked && (
              <Button onClick={checkAnswer} size="lg">
                Check Answer
              </Button>
            )}
            {isAnswerChecked && (
              <Button onClick={nextQuestion} size="lg">
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <OnScreenKeyboard 
          onKeyPress={handleKeyPress}
          language={currentWordList.language}
        />
      </div>
    </div>
  )
}

export default App3
