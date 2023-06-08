import React, { useCallback, useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom'
import anime from "animejs/lib/anime.es.js";
import icon from "./assets/reversi_icon.svg"
import Matchmake from './components/Matchmake';
import "./styles/homepage.css";

const Homepage = (props) => {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const [toggled, setToggled] = useState(false);
    const [mode, setMode] = useState(null);
    const navigate = useNavigate();
    const modeRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [findGameAlert, setfindGameAlert] = useState('nameInput')
    const [alertMsg, setAlert] = useState("");
    const [inQueue, setInQueue] = useState(false);


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
                    name: inputValue === "" ? "Black" : inputValue
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

    async function getGameinfo(id) {
        if (id !== "") {
            const url = process.env.REACT_APP_API + "/" + id;
            await fetch(url, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.REACT_APP_CHECKAPI,
                },
            },
            ).then((res) => {
                if (res.status === 200) {
                    setToggled(!toggled);
                    anime({
                        targets: ".tile",
                        opacity: 1,
                        delay: anime.stagger(50, {
                            grid: [columns, rows],
                            from: (columns * rows) / 2
                        })
                    });
                    setTimeout(() => {
                        navigate('/' + id);
                      }, 500);
                }
                else {
                    setfindGameAlert('nameInput notFound')
                    setAlert("Not found")
                    setTimeout(() => {
                        setfindGameAlert('nameInput notFoundv2')
                    }, 500)
                }
            })
            .catch((error) => {
                console.log(error)
    
            })
        }
        else {
            setfindGameAlert('nameInput notFound')
            setAlert("Not found")
            setTimeout(() => {
                setfindGameAlert('nameInput notFoundv2')
            }, 500)
        }
    }

    function matchmake() {
        window.addEventListener("popstate", cancelMatchmake)
        setToggled(!toggled);
        setInQueue(true);
        anime({
            targets: ".tile",
            opacity: 1,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: (columns * rows) / 2
            })
        });
        props.socket.emit("joinQueue");
        props.socket.on("leaveQueue", () => {
        props.socket.emit('leaveQueue');
        });
        props.socket.on("transfer", (gameId) => {
            setTimeout(() => {
                navigate('/' + gameId);
            }, 500);
        })
    }

    function cancelMatchmake() {        
        props.socket.off("leaveQueue");
        setToggled(true);
        setInQueue(false);
        anime({
            targets: ".tile",
            opacity: 0,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: (columns * rows) / 2
            })
        });
        props.socket.emit("leaveQueue");
        window.removeEventListener("popstate", cancelMatchmake)
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
      };

    return (
        <div id="homepage" className="wrapper">
            {inQueue && (
                <Matchmake cancelMatchmake={cancelMatchmake}/>
            )}
            {toggled && (
            <>
                <img className="logo" src={icon} alt="logo"></img> 
                {mode == null && (
                <div className='mode'>
                    <button className='createGame' id="matchmake" onClick={() => {
                        matchmake();}}>Matchmake</button>
                    <button type="submit" className="createGame" onClick={(event) => { 
                        setMode(1);
                        modeRef.current = 1;
                        window.addEventListener("keydown", function(event) {
                        if (event.key === "Escape") {
                            if (modeRef.current !== null) {
                                window.history.back();
                                setMode(null);
                                setInputValue('')
                                setfindGameAlert('nameInput')
                                setAlert('')
                                modeRef.current = null;
                            }
                        };

                        });
                        window.addEventListener("popstate", function(event) {
                            if (modeRef.current !== null) {
                                setMode(null);
                                setInputValue('')
                                setfindGameAlert('nameInput')
                                setAlert('')
                                modeRef.current = null;
                            }
                        })
                        window.history.pushState(null, '', '/');  
                        }}>Find Game</button>
                    <button type="submit" className="createGame" onClick={(event) => { 
                        createGame();
                        // setMode(0);
                        // modeRef.current = 1;
                        // document.addEventListener("keydown", function(event) {
                        //     if (event.key === "Escape") {
                        //         if (modeRef.current !== null) {
                        //             window.history.back();
                        //             setMode(null);
                        //             setInputValue('')
                        //             setfindGameAlert('nameInput')
                        //             setAlert('')
                        //             modeRef.current = null;
                        //         }
                        //     };
                        //     });
                        //     window.addEventListener("popstate", function(event) {
                        //         if (modeRef.current !== null) {
                        //             setMode(null);
                        //             setInputValue('')
                        //             setfindGameAlert('nameInput')
                        //             setAlert('')
                        //             modeRef.current = null;
                        //         }
                        //     })
                        // window.history.pushState(null, '', '/'); 
                        }}>Create Game</button>
                </div>
                )}
                {/* {mode === 0 &&
                    <form className='gameForm'>
                        <label>
                            Player name:
                            <input
                                className='nameInput'
                                type="text"
                                placeholder="Enter Player Name"
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        </label>
                        <button type="submit" className="createGame" onClick={() => { createGame() }}>Create</button>
                </form>
                )} */}
                {mode === 1 && (
                <form className='gameForm'>
                    <label>
                    Game ID:
                        <input 
                            className={`${findGameAlert}`}
                            type="text"
                            placeholder="Enter Game ID"
                            value={inputValue}
                            onChange={handleInputChange} />
                            <p className='notify'>{alertMsg}</p>
                    </label>
                    <button type="submit" className="createGame" onClick={async (e) => { 
                        e.preventDefault(); 
                        await getGameinfo(inputValue) 
                    }}>Find</button>
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
