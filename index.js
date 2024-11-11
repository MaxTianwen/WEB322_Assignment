// Import the Express library
const express = require("express");

// Import the 'path' module to handle file paths
const path = require("path");

// Import the custom data handling module, assumed to manage categories and articles
const storeData = require("./content-service");

// Create an Express application instance
const app = express();

// Set the HTTP port to an environment variable or default to 3838
const HTTP_PORT = process.env.PORT || 3838;

// Serve static files from the "public" directory (e.g., CSS, JS files, images)
app.use(express.static("public"));

// Route for the root path, redirecting to the "/about" page
app.get("/", (req, res) => {
  res.redirect("/about");
});

// Route for the "/about" page, serving the "about.html" file
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Route for the "/categories" endpoint, returning categories in JSON format
app.get("/categories", (req, res) => {
  storeData.getCategories().then((data) => {
    res.json(data); // Respond with categories as JSON
  });
});

// Route for the "/articles" endpoint, returning articles in JSON format
app.get("/articles", (req, res) => {
  storeData.getArticles().then((data) => {
    res.json(data); // Respond with articles as JSON
  });
});

// Initialize the data in the storeData module, then start the server
storeData.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;
