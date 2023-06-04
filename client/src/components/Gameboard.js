import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client'
import "../styles/gameboard.css"

const Gameboard = (props) => {
    const [array, setArray] = useState([])
    const [turn, setTurn] = useState(null)
    const [gameId] = useState(window.location.href.split('/')[window.location.href.split('/').length - 1]);
    const socket = useRef(null);

    useEffect(() => {
        getSessionInfo()
        socket.current = io(process.env.REACT_APP_SOCKET)
        socket.current.emit('joinRoom', gameId);
        console.log(socket)
        socket.current.on("updateSession", (player, row, column) => {
            updateArray(row, column, player);
            if (player == 1) {
                setTurn(2);
            }
            else {
                setTurn(1);
            }
        })
        return () => {
            socket.current.disconnect();
        } 
    }, []);


    async function getSessionInfo() {
        console.log("Fetching Data")
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
        })
    }

    async function handleTileClick(row, column) {
        const url = process.env.REACT_APP_API + "/" + gameId;
        await fetch(url, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.REACT_APP_CHECKAPI,
            },
            body: JSON.stringify({
                "move" : [row, column],
                "player": turn
            })

        }).then((res) => {
            console.log(res.status)
            if (res.status === 200) {
                updateArray(row, column, turn);
                socket.current.emit("move", gameId, turn, row, column);
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    function updateArray(row, column, value) {
        console.log(value);
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
                            if (tile == 0) {
                                return(
                                    <div className={`tile_empty ${turn == 1 ? "white": "black"}`} key={columnIndex} id={columnIndex} onClick={() => {handleTileClick(rowIndex, columnIndex)}}></div>
                                )
                            }
                            else if (tile == 1) {
                                return(
                                    <div className="tile_white" key={columnIndex}></div>
                                )
                            }
                            else if (tile == 2) {
                                return(
                                    <div className="tile_black" key={columnIndex}></div>
                                )
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