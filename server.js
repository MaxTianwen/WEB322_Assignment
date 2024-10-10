/*
Name: Tianwen Wang
Student ID: 151583226
Email: twang118@myseneca.ca
Created: 2024/10/06
Last Modified: 2024/10/10 
*/

// Import content-service module
const { getPublishedArticles, getAllArticles, getCategories, initialize } = require('./content-service')

const path = require('path');
// Include express module
const express = require('express');
// Create app object
const app = express();
// Assign a port
const HTTP_PORT = process.env.PORT || 9000;

app.use(express.static('public'));

initialize()
  .then(() => {
    app.get('/', (req, res) => {
      getPublishedArticles()
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          res.json({ message: err });
        })
    });
  })
  .catch(err => {
    console.log(err);
  });

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/about.html'));
})

app.get('/articles', (req, res) => {
  getAllArticles()
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        res.json({ message: err });
    });
})

app.get('/categories', (req, res) => {
  getCategories()
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        res.json({ message: err });
    });
})

app.listen(HTTP_PORT, () => {
  console.log(`Express http server listening on ${HTTP_PORT}`);
})
