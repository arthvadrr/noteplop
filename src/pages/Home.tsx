import type { ReactNode } from 'react';

function Home(): ReactNode {
  return (
    <div className="home">
      <header className="utility__container">
        <div className="utility__content">
          <h1>Note Plop</h1>
        </div>
      </header>
      <main>
        <div>I need components</div>
      </main>
    </div>
  )
}

export default Home;