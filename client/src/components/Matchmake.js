import React from 'react';
import { useState, useEffect } from 'react';
import '../styles/matchmake.css'

const Matchmake = (props) => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
          setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);
    
        return () => {
          clearInterval(timer);
        };
      }, []);
    return (
        <div id="homepage" className="MMwrapper">
            <div className='loading' onClick={() => {props.cancelMatchmake()}}>
                Matchmaking: <br/> 
                {`[${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}]`}
            </div>
        </div>
    );
};

export default Matchmake;