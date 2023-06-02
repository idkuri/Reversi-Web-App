import React, { useCallback, useEffect, useState} from 'react';
import anime from "animejs/lib/anime.es.js";
import "./styles/gamepage.css";

const Gamepage = () => {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const [toggled, setToggled] = useState(false);

    const createTile = useCallback(index => {
        return <div className="tile" key={index} id="gamepage"></div>;
    }, []);

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

    useEffect(() => {
        anime({
            targets: ".tile",
            opacity: toggled? 0 : 1,
            delay: anime.stagger(100, {
              grid: [columns, rows],
              from: (columns * rows - 1) / 2,
            }),
        });
        setTimeout(() => {
            setToggled(true);
        }, 2000)
    })

    return (
        <div id="gamepage" className="wrapper">
            <div className="grid" style={{'--columns': columns, '--rows': rows}}>
                {createGrid(columns * rows)}
            </div>
        </div>
    );
};

export default Gamepage;