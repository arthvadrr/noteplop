import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import './Home.scss'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home">
      <div className="home__logos">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="home__logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="home__logo home__logo--react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="home__card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/Home.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="home__docs-link">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default Home
