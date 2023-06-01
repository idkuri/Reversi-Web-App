// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('./routes/sessions');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.URI;

//Enable CORS
app.use(cors());

// Routing
app.use( express.json() )
app.use("/sessions", sessions)

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

// HTTP request listener
app.listen(port, () => {
  console.log(`Listening to this port: ${port}`)
}) 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
