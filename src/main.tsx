import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import App2 from './App2.tsx'  // Assume this is your new PEDMAS app
import './index.css'

const AppSelector = () => {
  const [selectedApp, setSelectedApp] = useState('basic')

  return (
    <div>
      <select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
        <option value="basic">Integer Addition / Subtraction</option>
        <option value="pedmas">PEDMAS</option>
      </select>
      {selectedApp === 'basic' ? <App /> : <App2 />}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSelector />
  </StrictMode>,
)
