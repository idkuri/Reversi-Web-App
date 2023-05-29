// Import dependencies
const express = require('express');
const sessionInfo = require("../models/sessionInfo");
const app = express();

// Code starts here
const router = express.Router();

router.get("/", (req, res) => {
    res.send(`getting sessionInfo`);
});

router.post("/", (req, res) => {
    const session = new sessionInfo({
        gameId : req.body.gameId,
        player1: req.body.player1,
        player2: req.body.player2
    })

    session.save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({error: err})
        })
    
})

module.exports = router;