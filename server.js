// "require" the Express module
const express = require('express');

// Get the absolute path
const path = require('path');

// obtain the "app" object
const app = express();

// set up a port
const HTTP_PORT = process.env.PORT || 3000; // Port number: 3000

// GET Route for index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})

// start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));

