const path = require('path');
// Include express module
const express = require('express');
// Create app object
const app = express();
// Assign a port
const HTTP_PORT = process.env.PORT || 9000;

app.use(express.static('public'));

// 
app.get('/', (req, res) => {
    res.redirect('/about');
})

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html'));
})

app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on ${HTTP_PORT}`);
})
