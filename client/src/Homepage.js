import React, { useCallback, useEffect, useState } from 'react';
import anime from "animejs/lib/anime.es.js";
import icon from "./assets/reversi_icon.svg"
import "./styles/homepage.css";

const Homepage = () => {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const [toggled, setToggled] = useState(false);
    const [mode, setMode] = useState(null);

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

        const tiles = document.querySelectorAll(".tile");
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

    async function createGame(event) {
        event.preventDefault()
        const gameId = makeid(6)
        console.log("Your game id: " + gameId);
        fetch("https://reversiapi.niome.dev/sessions", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "gameId" : gameId
            })
        }).then((result) => {
            console.log(result);
        })
    }

    return (
        <div id="wrapper" className="wrapper">
            {toggled ? 
            <img className="logo" src={icon} alt="logo" id="on"></img> 
            : 
            <img className="logo" src={icon} alt="logo"></img>}
            {toggled && (
            <>
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
                    <input type="text" />
                    </label>
                    <button type="submit" className="createGame" onClick={(event) => { createGame(event) }}>Create</button>
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
            </>
            )}
            
            <div className="grid" style={{'--columns': columns, '--rows': rows}}>
                {createGrid(columns * rows)}
            </div>
        </div>
    );
};

export default Homepage;
