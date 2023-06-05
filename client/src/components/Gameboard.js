import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import "../styles/gameboard.css"

const Gameboard = (props) => {
    const [array, setArray] = useState([])
    const [gameId] = useState(window.location.href.split('/')[window.location.href.split('/').length - 1]);
    const [turn, setTurn] = useState(null)
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();



    useEffect(() => {
        getSessionInfo();
        console.log(socket)
        if (socket == null) {
            setSocket(io(process.env.REACT_APP_SOCKET))
        }
        if (socket !== null) {
            socket.emit('joinRoom', gameId);
            socket.on("updateSession", (turn, row, column) => {
                updateArray(row, column, turn);
                getSessionInfo();
            })
            socket.on("message", (message) => {
                console.log(message)
            })
            return () => {
                if (socket && socket.connected) {
                    console.log("Disconnected");
                    socket.disconnect();
                }
            };
        }
    }, [gameId, socket]);


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
            return res.json()
        }).then((response) => {
            if (response.length === 0) {
                console.log("Game does not exist")
                navigate("/")
            }
            setArray(response[0].state)
            setTurn(response[0].turn)
            console.log(response[0])
            if (response[0].turn === 1) {
                console.log(response[0])
                props.setCurrentPlayer(response[0].player1.name + `'s turn`);
            }
            else if (response[0].turn === 2) {
                props.setCurrentPlayer(response[0].player2.name + `'s turn`);
            }
        }).catch((error) => {
            console.log("error")
        })
    }

    async function handleTileClick(row, column) {
        socket.emit("move", gameId, turn, row, column);
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