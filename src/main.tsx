import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import App2 from './App2.tsx'  // Assume this is your new PEDMAS app
import App3 from './App3'
import './index.css'

function Main() {
  const [selectedApp, setSelectedApp] = useState('App1')

  const renderSelectedApp = () => {
    switch (selectedApp) {
      case 'App1':
        return <App />
      case 'App2':
        return <App2 />
      case 'App3':
        return <App3 />
      default:
        return <App />
    }
  }

  return (
    <div className="container mx-auto p-4">
      <select
        className="mb-4 p-2 border rounded"
        value={selectedApp}
        onChange={(e) => setSelectedApp(e.target.value)}
      >
        <option value="App1">Addition / Subtraction</option>
        <option value="App2">PEDMAS</option>
        <option value="App3">Spelling</option>
      </select>
      {renderSelectedApp()}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
