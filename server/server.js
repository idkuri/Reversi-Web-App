// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('./routes/sessions');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const http = require('http');
const https = require('https');

require('dotenv').config();

const app = express();
const uri = process.env.URI;


const corsOptions = {
  origin: ['http://localhost:80', 'https://localhost:443', 'https://reversiproject.netlify.app']
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

    socket.on('move', (room, player, row, column) => {
      io.to(room).emit("updateSession", player == 1 ? 2 : 1, row, column)
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
