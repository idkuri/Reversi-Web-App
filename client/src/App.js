import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'
import Homepage from './Homepage';
import Gamepage from "./Gamepage"
import Background from './components/Background';
import Matchmake from './components/Matchmake';
import './styles/App.css';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    try {
      if (socket === null) {
        setSocket(io(process.env.REACT_APP_SOCKET))
      }
    }
    catch (error) {
      alert(error)
    }
  }, [socket])

  return (
    <>
      <Background/>
      <Routes>
        <Route path ="/" element={<Homepage socket={socket}/>}/>
        <Route path ="/:gameId" element={<Gamepage socket={socket}/>}/>
        <Route path ="/test" element={<Matchmake/>}/>
      </Routes>
    </>
  );
}

export default App;
