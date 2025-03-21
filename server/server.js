// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('./routes/sessions');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sessionInfo = require("./models/sessionInfo");
const { checkValidity, calculate, getValidMoves } = require('./utils/moveCalculations.js');
const { Mutex } = require('async-mutex');
const rateLimit = require('express-rate-limit');

const http = require('http');
// const https = require('https');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
  headers: true,
});

require('dotenv').config();

// Mutex locks for socket concurrency
const mutex = new Mutex(); 

const app = express();
const uri = process.env.URI;

const corsOptions = {
  origin: ['http://localhost:80', 'https://localhost:443', 'http://localhost:3000', 'http://localhost:3001', 'https://reversiproject.netlify.app']
};

app.use(limiter);

//Enable CORS
app.use(cors(corsOptions));

// Routing
app.use( express.json() )
app.use("/sessions", sessions)

// Certificate
// const privateKey = fs.readFileSync(process.env.CERTPRIV, 'utf8');
// const certificate = fs.readFileSync(process.env.CERT, 'utf8');
// const ca = fs.readFileSync(process.env.CA, 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };

// Connecting to the database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Successfully connected to MongoDB")
  deleteAllRooms();
})
.catch(() => {
  console.error("MongoDB Connection failed ", error);
  process.exit(1);
})

/**
 * Deletes all rooms from the database.
 */
async function deleteAllRooms() {
  try {
    const status = await mongoose.connection.db.dropCollection('sessions')
    if (status) { // Status === true
      console.log("All rooms deleted");
    }
  }
  catch (error) {
      console.log("Error in deleting all rooms: " + error)
      process.exit(1);
  }
}

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

const { instrument } = require('@socket.io/admin-ui');

const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "https://admin.socket.io", "https://reversiproject.netlify.app"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

// HTTP request listener
httpServer.listen(80, () => {
  console.log(`Listening to this port: 80`)
}) 

// httpsServer.listen(443, () => {
// 	console.log('HTTPS Server running on port 443');
// });

/**
 * Joins a player to a room.
 *
 * @param {string} room - The room ID.
 * @param {string} player - The player ID.
 * @returns {Array} - An array containing the player number and player information.
 */
async function joinRoom(room, player) {
  // Mutex lock to ensure one thread runs this function at a time
  const release = await mutex.acquire();
  try {
    console.log(`Room ${room} Player: ${player} joined`)
    let sessionState = await sessionInfo.find({ gameId: room});
    if (sessionState.length == 0) {
        console.log(`Room: ${room} was not found!`)
        return
    }
    else {
        const game = sessionState[0];
        if (game.player2.playerID === null) {
          game.player2.playerID = player
          await game.save();
          return [2, game.player2]
        }
        else if (game.player1.playerID === null) {
          me = 1
          game.player1.playerID = player
          await game.save();
          return [1, game.player1]
        }
        else {
          me = 3
          return [3, player]
        }
  
    }
  } finally {
    // Release lock upon completion
    release();
  }
} 


/**
 * Generates a random ID of the specified length.
 *
 * @param {number} length - The length of the ID to generate.
 * @returns {string} - The generated ID.
 */
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * Creates a new room.
 *
 * @param {string} room - The room ID.
 * @returns {number} - The status code indicating the result of the operation.
 */
async function createRoom(room) {
  console.log("Creating session: " + room);
  const sessions = await sessionInfo.find({ gameId: room});
  if (sessions.length == 0) {
      const session = new sessionInfo({
          gameId : room
      })
  
      try {
          await session.save();
          console.log("room created")
          return 200;
      }
      catch (err) {
          return 400;
      }
  }
  else {
      return 401;
  }
}

/**
 * Removes a player from a room.
 *
 * @param {string} room - The room ID.
 * @param {number} number - The player number (1 or 2).
 * @param {string} player - The player ID.
 * @returns {number} - The status code indicating the result of the operation.
 */
async function leaveRoom(room, number, player) {
  console.log(`Room ${room} Player: ${player} left`)
  let sessionState = await sessionInfo.find({ gameId: room});
  if (sessionState.length == 0) {
      console.log("Game not found")
      return
  }
  else {
    const game = sessionState[0];
    if (number === 2) {
      game.player2.playerID = null
      game.save()
      return 200
    }
    else if (number === 1) {
      game.player1.playerID = null
      game.save()
      return 200
    }
  }
}

/**
 * Deletes a room from the database.
 *
 * @param {string} room - The room ID.
 * @returns {number} - The status code indicating the result of the operation.
 */
async function deleteRoom(room) {
    try {
        const removeStatus = await sessionInfo.deleteOne({gameId: room});
        if (removeStatus.deletedCount == 0) {
            throw Error("Room does not exist")
        }
        else {
            return 200;
        }
    }
    catch (error) {
        console.log("Error in deleting room: " + error)
    }
}

io.on('connection', socket => {
  // console.log(`${socket.id} connected!`)

  // console.log(io.allSockets());
  socket.on('joinQueue', async () => {
    let queueInfo = await io.sockets.in('queue').allSockets();
    let queue = Array.from(queueInfo);
    if (queue.length === 0) {
      console.log(`${socket.id} is added to the queue`);
      await socket.join('queue')

    }
    else {
      const gameId = makeid(6);
      const match = Array.from(queue)
      io.to(match[0]).emit('leaveQueue')
      const status = await createRoom(gameId);
      if (status === 200) {
        io.to(match[0]).emit('transfer', gameId)
        io.to(socket.id).emit('transfer', gameId)

      }

    }
  })

  socket.on('leaveQueue', () => {
    console.log(`${socket.id} Leaving Queue`)
    socket.leave('queue');
  })
  
  // Listen for join rooms
  socket.on('joinRoom', async (room) => {
    const me = await joinRoom(room, socket.id)

    await socket.join(room);
    io.to(socket.id).emit("playerInfo", me[0]);

    

    // Listen for moves
    socket.on('move', async (room, player, row, column) => {
      if(!(me[0] === player)) {
        console.log(`Not ${me[0]}'s turn it is ${player}'s turn`)
        io.to(socket.id).emit("message", "NOT YOUR TURN")
        return;
      } 
      const status = await move(room, player, row, column);
      if (status.status == 200)
        io.to(room).emit("updateSession", player, row, column)
    })

    // Listen for room leaves
    socket.once('leaveRoom', async () => {
      await leaveRoom(room, me[0], socket.id)
      await socket.leave(room);
      if (io.sockets.adapter.rooms.get(room) === undefined) {
        console.log(`Delete timer started for room: ${room}`);
        setTimeout(async () => {
          if (io.sockets.adapter.rooms.get(room) === undefined) {
            const status = await deleteRoom(room)
            if (status === 200) {
              console.log(`Room: ${room} deleted`);
            }
          }
          else {
            console.log("Room delete canceled");
          }
        }, 60000);
      }
    });

    // Listen for disconnects
    socket.on('disconnect', async () => {
      await leaveRoom(room, me[0], socket.id)
      await socket.leave(room);
      if (io.sockets.adapter.rooms.get(room) === undefined) {
        console.log(`Delete timer started for room: ${room}`);
        setTimeout(async () => {
          if (io.sockets.adapter.rooms.get(room) === undefined) {
            const status = await deleteRoom(room)
            if (status === 200) {
              console.log(`Room: ${room} deleted`);
            }
          }
          else {
            console.log("Room delete canceled");
          }
        }, 60000);
      }
    });
  })
})




app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Handles a move in the game.
 *
 * @param {string} room - The room ID.
 * @param {number} current - The current player number.
 * @param {number} row - The row index of the move.
 * @param {number} column - The column index of the move.
 * @returns {Object} - An object containing the status code indicating the result of the operation.
 */
async function move(room, current, row, column) {
    try {
      // Get move from body
      console.log(`Room: ${room} player: ${current} attempting move: (${row}, ${column})`)
      const move = [row, column];
      const player = current;
      let state = null;
      let turn = null
      // Fetch database for state for current game
      let sessionState = await sessionInfo.find({ gameId: room});
      if (sessionState.length == 0) {
          console.log("Room was not found")
          return 400
      }
      else {
          state = sessionState[0].state
          turn = sessionState[0].turn
      }

      // Perform suggestions clean up
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (state[i][j] == -1) {
            state[i][j] = 0;
          }
        }
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
          console.log(move)
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

      if (!checkValidity(state, player, move)) {
          throw new Error("Invalid move")
      }

      // Calculate new state
      let nextPlayer = player == 1 ? 2 : 1
      state = calculate(state, player, move);

      let suggestions = getValidMoves(state, nextPlayer)
      if (suggestions.length == 0) {
        suggestions = getValidMoves(state, player)
        nextPlayer = player
      }
      if (suggestions.length == 0) {
        nextPlayer = -1
      }

      for (let i = 0; i < suggestions.length; i++) {
        state[suggestions[i][0]][suggestions[i][1]] = -1;
      }

      // Update state on database
      updateStatus = await sessionInfo.updateOne(
          {gameId: room},
          {$set: {
              state: state,
              turn: nextPlayer
          }}
      )
      return {
        status: 200, 
      }
    } 
    catch (error) {
        console.log("Error " + error)
        return {status: 400}
    }
}

