import NotePlopper from '../components/NotePlopper/NotePlopper';
import type { ReactNode } from 'react';

function Home(): ReactNode {
  return (
    <div className="home">
      <header className="utility__container">
        <div className="utility__content">
          <h1>NotePlop</h1>
        </div>
      </header>
      <main>
        <NotePlopper />
      </main>
    </div>
  )
}

export default Home;