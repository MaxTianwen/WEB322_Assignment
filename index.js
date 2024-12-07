const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
// Import the custom data handling module, assumed to manage categories and articles
const storeData = require("./content-service");
const methodOverride = require('method-override');
const e = require("express");

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

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Route for the root path, redirecting to the "/about" page
app.get("/", (req, res) => {
  res.redirect("/about");
});

// Route for the "/about" page, serving the "about.html" file
app.get("/about", (req, res) => {
  res.render("about");
});

// Route for the "/categories" endpoint, returning categories in JSON format
app.get("/categories", (req, res) => {
  storeData.getCategories()
    .then(data => {
      res.render("categories", { categories: data }); // Render categories.ejs
    })
    .catch(err => {
      res.status(404).render("404", { message: "No categories found." });
    });
});

// Route for the "/articles" endpoint
app.get("/articles", (req, res) => {
  const { category, minDate } = req.query;
  let articlePromise;

  // Get articles based on the query parameters
  if (category) {
    articlePromise = storeData.getArticlesByCategory(category);
  } else if (minDate) {
    articlePromise = storeData.getArticlesByMinDate(minDate);
  } else {
    articlePromise = storeData.getArticles();
  }

  // Use Promise.all to get both articles and categories
  Promise.all([articlePromise, storeData.getCategories()])
    .then(([articles, categories]) => {
      // Add category names to articles
      const articlesWithCategories = articles.map(article => ({
        ...article,
        categoryName: categories.find(cat => cat.id === article.category)?.Name || 'Uncategorized'
      }));
      
      res.render("articles", { articles: articlesWithCategories });
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).render("error", { 
        message: "Failed to fetch articles and categories", 
        error: err 
      });
    });
});



// Route for the "addArticle" endpoint, serving the "add-article.html" file
app.get("/articles/add", (req, res) => {
  storeData.getCategories()
    .then(categories => {
      res.render("addArticle", { categories: categories });
    })
    .catch(err => {
      res.status(404).render("404", { message: "No categories found.", error: err });
  })
});

// Route to display the modify article page
app.get("/articles/modify", (req, res) => {
    Promise.all([storeData.getArticles(), storeData.getCategories()])
        .then(([articles, categories]) => {
            // Add category name to each article
            const articlesWithCategories = articles.map(article => ({
                ...article,
                categoryName: categories.find(cat => cat.id === article.category)?.Name || 'Uncategorized'
            }));
            
            res.render("modifyArticle", { 
                articles: articlesWithCategories,
                categories: categories
            });
        })
        .catch(err => {
            res.status(500).render("404", { 
                message: "Error loading modification page", 
                error: err 
            });
        });
});


// Get articles by ID
app.get("/articles/:id", (req, res) => {
  storeData.getArticlesById(req.params.id)
    .then(article => {
      if (!article.published) {
        // If the article is not published, show the 404 page
        res.status(404).render("404", { message: "Article not found." });
        return;
      }
      // Add category name and convert published status for rendering
      const enrichedArticle = storeData.addCategoryToArticle(storeData.convertPublishedToYesNo(article));
      res.render("article", { article: enrichedArticle });
    })
    .catch(err => {
      res.status(404).render("404", { message: `Article with ID ${req.params.id} not found.`, error: err });
    });
});


// Update specific article by ID
app.put("/articles/:id", upload.single("featureImage"), (req, res) => {
    console.log("Starting article update for ID:", req.params.id);
    console.log("Request body:", req.body);
    
    let imageUrl = req.body.currentImage;

    const processUpdate = () => {
        if (req.file) {
            console.log("New image detected, starting upload to Cloudinary");
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            console.log("Image upload successful:", result.url);
                            resolve(result.url);
                        } else {
                            console.error("Image upload failed:", error);
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        }
        console.log("Using existing image URL:", imageUrl);
        return Promise.resolve(imageUrl);
    };

    processUpdate()
        .then(finalImageUrl => {
            console.log("Preparing article data with image URL:", finalImageUrl);
            const articleData = {
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                category: req.body.category,
                published: req.body.published === 'true',
                featureImage: finalImageUrl,
                articleDate: new Date()
            };
            console.log("Article data to update:", articleData);
            return storeData.updateArticle(req.params.id, articleData);
        })
        .then(updatedArticle => {
            console.log("Article successfully updated:", updatedArticle);
            res.json(updatedArticle);
        })
        .catch(err => {
            console.error("Update failed:", err);
            // Send appropriate status code based on error
            const statusCode = err.message.includes('No article found') ? 404 : 500;
            res.status(statusCode).json({
                message: err.message || "Failed to update article",
                error: err.toString()
            });
        });
});


// Get the article when user clicks on the "Edit" button
app.get("/api/articles/:id", (req, res) => {
    storeData.getArticlesById(req.params.id)
        .then(article => {
            res.json(article);
        })
        .catch(err => {
            res.status(404).json({ message: "Article not found", error: err });
        });
});


// Delete specific article by ID
app.delete("/articles/:id", (req, res) => {
    storeData.deleteArticle(req.params.id)
        .then(() => {
            res.json({ message: "Article deleted successfully" });
        })
        .catch(err => {
            res.status(500).json({ message: "Failed to delete article", error: err.message });
        });
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
