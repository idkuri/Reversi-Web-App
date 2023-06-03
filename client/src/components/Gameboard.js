import React, { useEffect, useState } from 'react';
import "../styles/gameboard.css"

const Gameboard = (props) => {
    const [array, setArray] = useState(Array.from({ length: 8 }, () => Array(8).fill(0)))
    const [turn, setTurn] = useState(1)


    useEffect(() => {
        updateArray(3, 3, 2);
        updateArray(3, 4, 1);
        updateArray(4, 3, 1);
        updateArray(4, 4, 2);
    }, []);

    function handleTileClick(row, column) {
        updateArray(row, column, (turn % 2) + 1);
        setTurn(turn + 1);
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
                                    <div className={`tile_empty ${(turn % 2) == 0 ? "white": "black"}`} key={columnIndex} onClick={() => {handleTileClick(rowIndex, columnIndex)}}></div>
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