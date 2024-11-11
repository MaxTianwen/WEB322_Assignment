const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
// Import the custom data handling module, assumed to manage categories and articles
const storeData = require("./content-service");

const app = express();
const HTTP_PORT = process.env.PORT || 3838;

// Set up the Cloudinary configuration
cloudinary.config({
  cloud_name: 'dhexphwrx',
  api_key: '354523574636764',
  api_secret: 'MLBZMyiK3CiA8rDb4muJXedPcqs',
  secure: true
});
const upload = multer();

// Use Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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
  const { category, minDate } = req.query;

  // Get articles based on the query parameters
  if (category) {
    storeData.getArticlesByCategory(category)
      .then(data => { res.json(data) })
      .catch(err => { res.status(404).json({ message: `Category ${category} does not exist!`, error: err }) });
  } else if (minDate) {
    storeData.getArticlesByMinDate(minDate)
      .then(data => { res.json(data) })
      .catch(err => { res.status(404).json({ message: `No articles newer than ${minDate}`, error: err }) });
  } else {
    storeData.getArticles().then((data) => {
      res.json(data);
  })}
});

// Route for the "addArticle" endpoint, serving the "add-article.html" file
app.get("/articles/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addArticle.html"));
});

// Get articles by ID
app.get("/articles/:id", (req, res) => {
  storeData.getArticlesById(req.params.id)
    .then(data => { res.json(data) })
    .catch(err => { res.status(404).json({ message: `Article with ID ${req.params.id} not found`, error: err }) });
});

/* Handle the submitted form for article using cloudinary image storage */
// Handle article submission
app.post("/articles/add", upload.single("featureImage"), (req, res) => {
  // Check if a file is in the request
  if (req.file) {
    // Create a promise to deal with the request
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        // Create a stream to upload the file to Cloudinary
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        // Store the file content into a buffer, then convert it to a stream and pipe it to the Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // Handle the upload process using async/await
    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }
    
    // Run the upload process and handle the result
    upload(req)
      .then((uploaded) => {
        processArticle(uploaded.url);
      })
      .catch(err => res.status(500).json({ message: "Image upload failed", error: err }));
  } else {
    processArticle("");
  }

  // Function to store the new article data
  function processArticle(imageUrl) {
    // Add the URL to the request body
    req.body.featureImage = imageUrl;
    // Call function addArticle to store the newly added article and handle the response
    storeData.addArticle(req.body)
      .then(() => res.redirect("/articles"))
      .catch(err => res.status(500).json({ message: "Article creation failed", error: err }));
  }
});

// Initialize the data in the storeData module, then start the server
storeData.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;
