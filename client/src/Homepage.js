import React, { useCallback, useEffect, useState } from 'react';
import anime from "animejs/lib/anime.es.js";
import "./styles/homepage.css";

const Homepage = () => {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const [toggled, setToggled] = useState(true);

    const tileOnClick = useCallback(index => {
        setToggled(prevToggled => !prevToggled);
        console.log("Tile " + index + " clicked");
        anime({
            targets: ".tile",
            opacity: toggled ? 0 : 1,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: index
            })
        });
    }, [toggled, columns, rows]);

    const createTile = useCallback(index => {
        return <div className="tile" key={index} onClick={() => {tileOnClick(index)}}/>;
    }, [tileOnClick]);

    const createGrid = useCallback(quantity => {
        return Array.from(Array(quantity)).map((_, index) => createTile(index));
    }, [createTile]);

    const resizeHandler = useCallback(() => {
        const newColumns = Math.floor(document.body.clientWidth / 125);
        const newRows = Math.floor(document.body.clientHeight / 125);
        setColumns(newColumns);
        setRows(newRows);
    }, []);

    useEffect(() => {
        resizeHandler();
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [resizeHandler]);

    return (
        <div id="wrapper" className="wrapper">
            {toggled ? <p className='loading_font'>Click anywhere to get started!</p> : <></>}
            <div className="grid" style={{'--columns': columns, '--rows': rows}}>
                {createGrid(columns * rows)}
            </div>
        </div>
    );
};

export default Homepage;
