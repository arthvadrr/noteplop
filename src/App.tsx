import { ScoreProvider } from './contexts/ScoreContext/ScoreContext';
import Home from './pages/Home';
import './styles/main.scss';

function App() {
  return (
    <ScoreProvider>
      <Home />
    </ScoreProvider>
  );
}

export default App;
