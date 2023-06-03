const mongoose = require('mongoose');

const array = Array.from({ length: 8 }, () => Array(8).fill(0));
array[3][3] = 2
array[3][4] = 1
array[4][3] = 1
array[4][4] = 2

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
        default: 2
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