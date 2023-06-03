// Import dependencies
const express = require('express');
const sessionInfo = require("../models/sessionInfo");
const app = express();

// Code starts here
const router = express.Router();

// Get all sessions
router.get("/", async (req, res) => {
    console.log("Fetching all sessions")
    try {
        const sessions = await sessionInfo.find();
        res.status(200).json(sessions);
    }
    catch (err) {
        res.status(400).json({error: err})
    }
});

// Find session by sessionID
router.get("/:sessionId", async (req, res) => {
    console.log(`Fetching sessionId: ${req.params.sessionId}`);
    try {
        const sessionId = req.params.sessionId;
        const sessions = await sessionInfo.find({ gameId: sessionId});

        if (sessions.length == 0) {
            res.status(404).json({error: "Not Found"}); // If data not found return 404 status
        }
        else {
            res.status(200).json(sessions); 
        }
    }
    catch (err) {
        res.status(400).json({error: err})
    }
});


// Create new session
router.post("/", async (req, res) => {
    console.log("Creating session");
    const sessions = await sessionInfo.find({ gameId: req.body.gameId});
    if (sessions.length == 0) {
        const session = new sessionInfo({
            gameId : req.body.gameId,
            player1: req.body.player1,
            player2: req.body.player2
        })
    
        try {
            const storedSession = await session.save();
            res.status(200).json(storedSession);
        }
        catch (err) {
            res.status(400).json({error: err})
        }
    }
    else {
        res.status(500).json({error: "Game already exists"})
    }
    
})

// Calculates the new state of the game given the current state and the move
function calculate(state, player, move) {
    console.log("Calculating game state")
    const array = state
    array[move[0]][move[1]] = player
    console.log("Player " + player + " did this move " + "row: " + move[0] + " column: " + move[1]);
    return array;
}

// Update new session
router.patch("/:sessionId", async (req, res) => {
    console.log("Updating session: " + req.params.sessionId);
    try {
        // Get move from body
        const move = req.body.move;
        const player = req.body.player;
        let state = null;
        let turn = null
        // Fetch database for state for current game
        let sessionState = await sessionInfo.find({ gameId: req.params.sessionId});
        if (sessionState.length == 0) {
            res.status(404).json({error: "Game not found"})
            return
        }
        else {
            state = sessionState[0].state
            turn = sessionState[0].turn
        }

        /* Checking conditions:
            1) Move is specified
            2) Player is 1 or 2
            3) Player is an integer
            4) Move is an array
            5) Move is of length 2
            6) 0 <= Move[0] <= 7 and 0 <= Move[1] <= 7
            7) Correct player's turn to move
        */

         // If body didn't specify move so we return an error [1]
        if (!move) {
            throw new Error("Missing 'move' parameter in the request body")
        }
        // Player is and a number and Player is 1 or 2 [2-3]
        if (!Number.isInteger(player) || (player !== 1 && player !== 2)) {
            throw new Error("Player is not an integer or not 1 or 2");
        }
        // Move is an array && Move is of length 2 && Move is between 0 and 7 [4-6]
        if (!(move instanceof Array) || move.length !== 2 || !(0 <= move[0] && move[0] <= 7) || !(0 <= move[1] && move[1] <= 7)) {
            throw new Error("Syntax of move or move index is incorrect");
        }
        // Incorrect player's turn [7]
        if (player != turn || typeof player === "undefined") {
            throw new Error("It is not this player's turn or player not specified")
        }

        // Calculate new state
        state = calculate(state, player, move);

        // Update state on database
        updateStatus = await sessionInfo.updateOne(
            {gameId: req.params.sessionId},
            {$set: {
                state: state,
                turn: player == 1 ? 2 : 1
            }}
        )
        const new_sessionInfo = await sessionInfo.find({ gameId: req.params.sessionId});
        if (new_sessionInfo.length == 0) {
            res.status(404).json({error: "Game not found"})
        }
        else {
            res.status(200).json(new_sessionInfo);
        }
    } 
    catch (error) {
        res.status(400).json({error: error.message});
    }
})

// Delete a session
router.delete("/:sessionId", async (req, res) => {
    try {
        const removeStatus = await sessionInfo.deleteOne({gameId: req.params.sessionId});
        if (removeStatus.deletedCount == 0) {
            res.status(404).json({error: "Game does not exist"})
        }
        else {
            res.status(200).json("Game successfully removed");
        }
    }
    catch (error) {
        res.status(400).json({error: err});
    }
})


module.exports = router;