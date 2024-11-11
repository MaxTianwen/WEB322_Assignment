// Import the 'fs' module for interacting with the file system
const fs = require("fs");

// Arrays to store categories and articles data loaded from JSON files
let categories = [];
let articles = [];

// Function to initialize data by loading categories and articles from JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    // Read the categories data from categories.json file
    fs.readFile("./data/categories.json", "utf8", (err, cat) => {
      if (err) return reject(err); // Reject the promise if an error occurs during file read
      categories = JSON.parse(cat); // Parse and store categories data

      // Nested readFile for articles.json
      // We nest the second file read inside the first because we want to ensure that categories.json
      // is successfully read and parsed before moving on to articles.json.
      // This way, we load both files sequentially and can handle any errors independently.
      fs.readFile("./data/articles.json", "utf8", (err, art) => {
        if (err) return reject(err); // Reject the promise if an error occurs during file read
        articles = JSON.parse(art); // Parse and store articles data
        
        // We call resolve() only once, after both files have been successfully read and parsed.
        // Calling resolve() here signifies that initialization is complete and both categories
        // and articles data are ready for use. If we called resolve() earlier, it would 
        // prematurely indicate that initialization was complete before loading both files.
        resolve(); 
      });
    });
  });
}

// Function to get only published articles by filtering the articles array
function getPublishedArticles() {
  return Promise.resolve(articles.filter(article => article.published)); // Return only articles with `published: true`
}

// Function to get all categories
function getCategories() {
  return Promise.resolve(categories); // Return the categories array as a resolved promise
}

// Function to get all articles
function getArticles() {
  return Promise.resolve(articles); // Return the articles array as a resolved promise
}

// Export the functions as an object to make them available to other files
module.exports = { initialize, getCategories, getArticles };
