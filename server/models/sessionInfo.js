const mongoose = require('mongoose');

const array = Array.from({ length: 8 }, () => Array(8).fill(0));
array[4][4] = 2
array[4][5] = 1
array[5][4] = 1
array[5][5] = 2

// Structure for the sessionInfo
const sessioninfoSchema = mongoose.Schema({
    gameId : {
        type: String,
        required: true
    },
    state : {
        type: Array,
        default: array
    },
    turn: {
        type: Number,
        default: 1
    },
    player1 : {
        type: String,
        default: "Player 1"
    },
    player2 : {
        type: String,
        default: "Player 2"
    }

})


module.exports = mongoose.model("sessions", sessioninfoSchema)