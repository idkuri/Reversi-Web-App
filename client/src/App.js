import { Route, Routes } from 'react-router-dom';
import Homepage from './Homepage';
import Gamepage from "./Gamepage"
import Background from './components/Background';
import './styles/App.css';

function App() {
  return (
    <>
      <Background/>
      <Routes>
        <Route path ="/" element={<Homepage/>}/>
        <Route path ="/:gameId" element={<Gamepage/>}/>
      </Routes>
    </>
  );
}

export default App;
