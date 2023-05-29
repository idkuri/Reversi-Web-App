const mongoose = require('mongoose');

const array = Array.from({ length: 64 }, (_, index) =>
  [27, 36].includes(index) ? 2 : ([28, 35].includes(index) ? 1 : 0)
);

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