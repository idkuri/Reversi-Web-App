// Import dependencies
const express = require('express');
const sessionInfo = require("../models/sessionInfo");
const app = express();
const apiKeyAuth = require('../utils/apiKeyAuth')

// Code starts here
const router = express.Router();

/**
 * Get all sessions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get("/", async (req, res) => {
    try {
        const sessions = await sessionInfo.find();
        res.status(200).json(sessions);
    }
    catch (err) {
        res.status(400).json({error: err})
    }
});

/**
 * Find session by session ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.get("/:sessionId", apiKeyAuth , async (req, res) => {
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

/**
 * Create a new session.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/", apiKeyAuth, async (req, res) => {
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


module.exports = router;