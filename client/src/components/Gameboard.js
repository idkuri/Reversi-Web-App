import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client'
import "../styles/gameboard.css"

const Gameboard = ({ currentPlayer, setCurrentPlayer, toggled }) => {
    const [array, setArray] = useState([])
    const [turn, setTurn] = useState(null)
    const [playerOne, setPlayerOne] = useState(null);
    const [playerTwo, setPlayerTwo] = useState(null);
    const [gameId] = useState(window.location.href.split('/')[window.location.href.split('/').length - 1]);
    const socket = useRef(null);

    useEffect(() => {
        getSessionInfo()
        setCurrentPlayer((turn === 1) ? `${playerOne}'s turn` : `${playerTwo}'s turn`);
        socket.current = io(process.env.REACT_APP_SOCKET)
        socket.current.emit('joinRoom', gameId);
        socket.current.on("updateSession", (turn, row, column) => {
            updateArray(row, column, turn);
            if (turn === 1) {
                setTurn(2);
            }
            else {
                setTurn(1);
            }
            getSessionInfo()
        })
        return () => {
            socket.current.disconnect();
        } 
    }, [gameId, setCurrentPlayer, playerOne, playerTwo, turn]);


    async function getSessionInfo() {
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
            return res.json()
        }).then((response) => {
            setArray(response[0].state)
            setTurn(response[0].turn)
            setPlayerOne(response[0].player1);
            setPlayerTwo(response[0].player2);
        })
    }

    function handleTileClick(row, column) {
        socket.current.emit("move", gameId, turn, row, column);
    }

    function updateArray(row, column, value) {
        setArray(prevArray => {
            const newArray =  [...prevArray];
            newArray[row][column] = value;
            return newArray
        })
    }


    if (toggled) {
        return (
            <div className='board'>
                {array.map((row, rowIndex) => {
                   return(
                      <div className="row" key={rowIndex}>
                        {row.map((tile, columnIndex) => {
                            if (tile === 0) {
                                return(
                                    <div className={`tile_empty ${turn === 1 ? "white": "black"}`} key={columnIndex} id={columnIndex} onClick={() => {handleTileClick(rowIndex, columnIndex)}}>{rowIndex}, {columnIndex}</div>
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
                                return <></>
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