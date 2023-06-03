import React, { useEffect, useState } from 'react';
import "../styles/gameboard.css"

const Gameboard = (props) => {
    const [array, setArray] = useState([])
    const [turn, setTurn] = useState(1)


    useEffect(() => {
        getSessionInfo()
    }, []);


    async function getSessionInfo() {
        const location = window.location.href.split('/')
        const gameId = location[location.length - 1]
        const url = "https://reversiapi.niome.dev/" + gameId;
        await fetch(url, {
            method: "GET"
        }).then((res) => {
            return res.json()
        }).then((response) => {
            setArray(response[0].state)
        })
    }

    function handleTileClick(row, column) {
        const location = window.location.href.split('/')
        const gameId = location[location.length - 1]
        updateArray(row, column, (turn % 2) + 1);
        setTurn(turn + 1);
        const url = "https://reversiapi.niome.dev/" + gameId;
        fetch(url, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "move" : [row, column],
                "player": (turn % 2) + 1
            })

        }).catch((err) => {
            console.log(err)
        })
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
                            if (tile == 0) {
                                return(
                                    <div className={`tile_empty ${(turn % 2) == 0 ? "white": "black"}`} key={columnIndex} id={columnIndex} onClick={() => {handleTileClick(rowIndex, columnIndex)}}></div>
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