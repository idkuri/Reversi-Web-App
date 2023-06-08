import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'
import "../styles/gameboard.css"

const Gameboard = (props) => {
    const [array, setArray] = useState([])
    const [gameId] = useState(window.location.href.split('/')[window.location.href.split('/').length - 1]);
    const [turn, setTurn] = useState(null)
    const [playerNum, setPlayerNum] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        setTimeout(() => {
            if (turn === -1) {
                const numBlack = document.querySelectorAll(".tile_black").length;
                const numWhite = document.querySelectorAll(".tile_white").length;
                if (numBlack > numWhite) {
                    props.setCurrentPlayer(`Black wins! Black Count: ${numBlack} White Count: ${numWhite}`);
                }
                else if (numBlack < numWhite) {
                    props.setCurrentPlayer(`White wins! Black Count: ${numBlack} White Count: ${numWhite}`);
                }
                else {
                    props.setCurrentPlayer(`Draw! Black Count: ${numBlack} White Count: ${numWhite}`);
                }
            }
        }, 1500)
    }, [turn, props])

    useEffect(() => {
        getSessionInfo();
        if (props.socket !== null) {
            props.socket.emit('joinRoom', gameId);
            props.socket.on("updateSession", (turn, row, column) => {
                updateArray(row, column, turn);
                getSessionInfo();
            })
            props.socket.on("message", (message) => {
                console.log(message)
            })
            props.socket.on("playerInfo", (playerNum) => {
                setPlayerNum(playerNum)
                if (playerNum === 2) {
                    props.setRole("Black")
                }
                else if (playerNum === 1) {
                    props.setRole("White")
                }
                else if (playerNum === 3) {
                    props.setRole("Spectating")
                }
            })
            window.addEventListener('popstate', () => {
                handlePopState();
            })
        }
    }, [gameId, props.socket]);

    function handlePopState() {
        props.socket.emit('leaveRoom', gameId);
        window.removeEventListener('popstate', handlePopState);
    }
      


    async function getSessionInfo() {
        console.log("Fetching game info");
        const location = window.location.href.split('/')
        const gameId = location[location.length - 1]
        const url = process.env.REACT_APP_API + "/" + gameId;
        await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.REACT_APP_CHECKAPI,
            },
        },
        ).then((res) => {
            if (res.status === 404) {
                throw new Error(404)
            }
            return res.json()
        }).then((response) => {
            setArray(response[0].state)
            setTurn(response[0].turn)
            if (response[0].turn === 1) {
                props.setCurrentPlayer(response[0].player1.name + `'s turn`);
            }
            else if (response[0].turn === 2) {
                props.setCurrentPlayer(response[0].player2.name + `'s turn`);
            }
        }
        ).catch((error) => {
            if (error.message === "404") {
                alert("Game not found");
                navigate("/");
            }
            else {
                console.log(error)
            }
        })
    }

    async function handleTileClick(row, column) {
        if (turn === playerNum) {
            props.socket.emit("move", gameId, turn, row, column);
        }
    }

    function updateArray(row, column, value) {
        setArray(prevArray => {
            const newArray =  [...prevArray];
            newArray[row][column] = value;
            return newArray
        })
    }


    if (props.toggled) {
        return (
            <div className='board'>
                {array.map((row, rowIndex) => {
                   return(
                      <div className="row" key={rowIndex}>
                        {row.map((tile, columnIndex) => {
                            if (tile === 0) {
                                return(
                                    <div className={`tile_empty ${turn === 1 ? "white": "black"}`} key={columnIndex} id={columnIndex} onClick={async () => {await handleTileClick(rowIndex, columnIndex)}}/>
                                )
                            }
                            else if (tile === 1) {
                                return(
                                    <div className="tile_white" key={columnIndex}></div>
                                )
                            }
                            else if (tile === 2) {
                                return(
                                    <div className="tile_black" key={columnIndex}></div>
                                )
                            }
                            else {
                                if (turn === playerNum) {
                                    return <div className={`tile_empty suggest ${turn === 1 ? "white": "black"}`} key={columnIndex} onClick={async () => {await handleTileClick(rowIndex, columnIndex)}}></div>
                                }
                                else {
                                    return <div className={`tile_empty ${turn === 1 ? "white": "black"}`} key={columnIndex} id={columnIndex} onClick={async () => {await handleTileClick(rowIndex, columnIndex)}}/>
                                }
                            }
                        })}
                    </div>
                    )
                })}
            </div>
        );
    }
};

export default Gameboard;