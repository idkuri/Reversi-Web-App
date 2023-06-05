import React, { useCallback, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'
import anime from "animejs/lib/anime.es.js";
import icon from "./assets/reversi_icon.svg"
import "./styles/homepage.css";

const Homepage = () => {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const [toggled, setToggled] = useState(false);
    const [mode, setMode] = useState(null);
    const navigate = useNavigate();

    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    const tileOnClick = useCallback(index => {
        setToggled(!toggled);
        anime({
            targets: ".tile",
            opacity: 0,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: index
            })
        });

        const tiles = document.querySelectorAll(".grid");
        tiles.forEach(tile => {
          tile.style.pointerEvents = "none";
        });
      
    }, [toggled, columns, rows]);

    const createTile = useCallback(index => {
        return <div className="tile" key={index} onClick={() => {tileOnClick(index)}}></div>;
    }, [tileOnClick]);

    const createGrid = useCallback(quantity => {
        return Array.from(Array(quantity)).map((_, index) => createTile(index));
    }, [createTile]);

    const resizeHandler = useCallback(() => {
        if (!toggled) {
            const newColumns = Math.floor(document.body.clientWidth / 125);
            const newRows = Math.floor(document.body.clientHeight / 125);
            setColumns(newColumns);
            setRows(newRows);
        }
    }, [toggled]);

    useEffect(() => {
        resizeHandler();
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [resizeHandler]);

    const [inputValue, setInputValue] = useState('');

    async function createGame() {
        setToggled(!toggled);
        const gameId = makeid(6);
        anime({
            targets: ".tile",
            opacity: 1,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: (columns * rows) / 2
            })
        });
        console.log("Your game id: " + gameId);
        await fetch(process.env.REACT_APP_API, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.REACT_APP_CHECKAPI,
            },
            body: JSON.stringify({
                "gameId" : gameId,
                "player2" : {
                    name: inputValue
                }
            })
        }).then((result) => {
            if (result.status === 200) {
                setTimeout(() => {
                    navigate('/' + gameId);
                  }, 500);
            }
            else if (result.status === 500) { // Game exists we will try with a different id
                console.log("Game already exists navigating to the current game");
                createGame()
                return
            }
            else {
                alert("Error of status: " + result.status)
            }
        })
        .catch((err) => {
            alert(err);
        })
        
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
      };

    return (
        <div id="homepage" className="wrapper">
            {toggled && (
            <>
                <img className="logo" src={icon} alt="logo"></img> 
                {mode == null && (
                <div className='mode'>
                    <button type="submit" className="createGame" onClick={() => { setMode(1) }}>Find Game</button>
                    <button type="submit" className="createGame" onClick={() => { setMode(0) }}>Create Game</button>
                </div>
                )}
                {mode === 0 && (
                    <form className='gameForm'>
                        <label>
                            Player name:
                            <input
                                type="text"
                                placeholder="Player 1"
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        </label>
                        <button type="submit" className="createGame" onClick={() => { createGame() }}>Create</button>
                </form>
                )}
                {mode === 1 && (
                <form className='gameForm'>
                    <label>
                    Game ID:
                    <input type="text" />
                    </label>
                    <button type="submit" className="createGame">Find</button>
                </form>
                )}
            </>)}
            
            <div className="grid" style={{'--columns': columns, '--rows': rows}}>
                {createGrid(columns * rows)}
            </div>
        </div>
    );
};

export default Homepage;
