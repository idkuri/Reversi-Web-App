// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('./routes/sessions');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sessionInfo = require("./models/sessionInfo");

const http = require('http');
const https = require('https');

require('dotenv').config();

const app = express();
const uri = process.env.URI;


const corsOptions = {
  origin: ['http://localhost:80', 'https://localhost:443', 'http://localhost:3000', 'http://localhost:3001', 'https://reversiproject.netlify.app']
};

//Enable CORS
app.use(cors(corsOptions));

// Routing
app.use( express.json() )
app.use("/sessions", sessions)

// Certificate
const privateKey = fs.readFileSync(process.env.CERTPRIV, 'utf8');
const certificate = fs.readFileSync(process.env.CERT, 'utf8');
const ca = fs.readFileSync(process.env.CA, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Connecting to the database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Successfully connected to MongoDB")
})
.catch(() => {
  console.error("MongoDB Connection failed ", error);
  process.exit(1);
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const { instrument } = require('@socket.io/admin-ui');
const { env, hrtime } = require('process');
const io = require("socket.io")(httpsServer, {
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

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});


io.on('connection', socket => {
  console.log(`user: ${socket.id} connected`)

  socket.on('joinRoom', (room) => {
    console.log(`user: ${socket.id} joining room: ${room}`)
    socket.join(room)

    socket.on('move', async (room, player, row, column) => {
      const status = await move(room, player, row, column);
      if (status == 200)
        io.to(room).emit("updateSession", player, row, column)
    })
  })

  socket.on('disconnect', () => {
    console.log(`user: ${socket.id} disconnected`);
  });
})



app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Calculates the new state of the game given the current state and the move
function calculate(state, player, move) {

  // Conditions need to be met: 
  // 1) White vicinity
  // 2) Same piece in range 
  let array = state
  array[move[0]][move[1]] = player
  // Horizontal search
  const hResult = searchHorizontal(array, player, move)
  console.log(`Horizontal Start: ${hResult[0]} End: ${hResult[1]}`)
  array = flipHorizontal(array, player, move[0], hResult[0], hResult[1]);


  // Implement Vertical
  const vResult = searchVertical(array, player, move)
  console.log(`Vertical Start: ${vResult[0]} End: ${vResult[1]}`)
  array = flipVertical(array, player, move[1], vResult[0], vResult[1]);

  // Implement Diagonal
  const dResult = searchDiagonal(array, player, move)
  array = flipDiagonal(array, player, dResult[0], dResult[1]);

  return array;
}

function searchHorizontal(state, player, move) {
  let start = move[1]
  let end = move[1]

  for (let i = move[1]-1; i >= 0 ; i--) {
    if (state[move[0]][i] == 0) {
      break
    }
    if (state[move[0]][move[1]-1] == player) {
      break
    }
    if (state[move[0]][i] == player) {
      start = i
      break
    }
  }


  for (let i = move[1]+1; i < 8; i++) {
    if (state[move[0]][i] == 0) {
      break
    }
    if (state[move[0]][move[1]+1] == player) {
      break
    }
    if (state[move[0]][i] == player) {
      end = i
      break
    }
  }
  return [start, end]
}

function searchVertical(state, player, move) {
  let start = move[0]
  let end = move[0]
  for (let i = move[0]-1; i >= 0 ; i--) {
    if (state[i][move[1]] == 0) {
      break
    }
    if (state[move[0]-1][move[1]] == player) {
      break
    }
    if (state[i][move[1]] == player) {
      start = i
      break
    }
  }
  for (let i = move[0]+1; i < 8; i++) {
    if (state[i][move[1]] == 0) {
      break
    }
    if (state[move[0]+1][move[1]] == player) {
      break
    }
    if (state[i][move[1]] == player) {
      end = i
      break
    }
  }
  return [start, end]
}

function searchDiagonal(state, player, move) {
  // DR short hand for down right
  // TR short hand for top right
  let DRstart = move
  let DRend = move
  let TRstart = move
  let TRend = move

  // [negative \] < relative to the columns
  for (let i = move[0]-1, j = move[1]-1; i >= 0 && j >= 0  ; i--, j--) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]-1][move[1]-1] == player) {
      break
    }
    if (state[i][j] == player) {
      DRstart = [i, j]
      break
    }
  }
  // [positive \] < relative to the columns
  for (let i = move[0]+1, j = move[1]+1; i < 8 && j < 8; i++, j++) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]+1][move[1]+1] == player) {
      break
    }
    if (state[i][j] == player) {
      DRend = [i, j]
      break
    }
  }
  // // [positive /] < relative to the columns
  for (let i = move[0]-1, j = move[1]+1; i >= 0 && j < 8  ; i--, j++) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]-1][move[1]+1] == player) {
      break
    }
    if (state[i][j] == player) {
      TRend = [i, j]
      break
    }
  }
  // // [negative /] < relative to the columns
  for (let i = move[0]+1, j = move[1]-1; i < 8 && j >= 0  ; i++, j--) {
    if (state[i][j] == 0) {
      break
    }
    if (state[move[0]+1][move[1]-1] == player) {
      break
    }
    if (state[i][j] == player) {
      TRstart = [i, j]
      break
    }
  }
  return [[DRstart, DRend], [TRstart, TRend]]
}

function flipHorizontal(state, player, row, start, end) {
  let array = state
  for (let i = start; i <= end; i++ ) {
    array[row][i] = player
  }
  return array;
}

function flipVertical(state, player, column, start, end) {
  let array = state
  for (let i = start; i <= end; i++ ) {
    array[i][column] = player
  }
  return array;
}

function flipDiagonal(state, player, DR, TR) {
  const DRstart = DR[0]
  const DRend = DR[1]
  const TRstart = TR[0]
  const TRend = TR[1]

  let array = state
  for (let i = DRstart[0], j = DRstart[1]; i <= DRend[0] && j <= DRend[1]; i++, j++) {
    array[i][j] = player
  }
  for (let i = TRstart[0], j = TRstart[1]; i >= TRend[0] && j <= TRend[1]; i--, j++) {
    array[i][j] = player
  }
  return array;
}

function checkValidity(state, player, move, array) {
  let result = array
    const hResult = searchHorizontal(state, player, move)
    const vResult = searchVertical(state, player, move)
    const dResult = searchDiagonal(state, player, move)
    const cond1 = (hResult[0] - hResult[1]) === 0 // true means no flip
    const cond2 = (vResult[0] - vResult[1]) === 0 // true means no flip
    const DRstart = dResult[0][0]
    const DRend = dResult[0][1]
    const TRstart = dResult[1][0]
    const TRend = dResult[1][1];
    const DReq = (DRstart[0] === DRend[0]) && (DRstart[1] === DRend[1])
    const TReq = (TRstart[0] === TRend[0]) && (TRstart[1] === TRend[1])
    const cond3 = DReq && TReq // true means no flip
    console.log(cond1 && cond2 && cond3 ? "invalid" : "valid");
    if (cond1 && cond2 && cond3) {{
      return false
    }}
  return true // return array of position that has
}

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

      if (!checkValidity(state, player, move, [0])) {
          throw new Error("Invalid move")
      }

      // Calculate new state
      state = calculate(state, player, move);

      // Update state on database
      updateStatus = await sessionInfo.updateOne(
          {gameId: room},
          {$set: {
              state: state,
              turn: player == 1 ? 2 : 1
          }}
      )
      return 200
    } 
    catch (error) {
        console.log("Error " + error)
        return 400
    }
}

