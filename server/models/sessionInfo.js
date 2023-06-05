const mongoose = require('mongoose');

const array = Array.from({ length: 8 }, () => Array(8).fill(0));
array[3][3] = 1
array[3][4] = 2
array[4][3] = 2
array[4][4] = 1

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
    player1: {
        type: {
            playerID: {
                type: String,
                default: null
            },
            name: {
                type: String,
                default: "Player 1"
            }
        },
        default: { playerID: null, name: null }
    },
    player2: {
        type: {
            playerID: {
                type: String,
                default: null
            },
            name: {
                type: String,
                default: "Player 2"
            }
        },
        default: { playerID: null, name: null }
    },

})


module.exports = mongoose.model("sessions", sessioninfoSchema)