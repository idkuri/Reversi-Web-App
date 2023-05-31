import { Route, Routes } from 'react-router-dom';
import Homepage from './Homepage';
import './App.css';

function App() {
  return (
    <div>
      <Routes>
        <Route path ="/" element={<Homepage/>}/>
      </Routes>
    </div>
  );
}

export default App;
