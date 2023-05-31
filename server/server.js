// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('./routes/sessions');
require('dotenv').config();

const app = express();
// process.env.PORT is used by heroku for their own PORTS, if it doesnt exist it will use port 3000. -> localhost:3000
const port = process.env.PORT || 3000;
const uri = process.env.URI;

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

app.get('/', (req, res) => {
  res.send('Kuri says hi :3')
})