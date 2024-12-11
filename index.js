const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeData = require("./content-service");
const methodOverride = require('method-override');    // Used for PUT and DELETE requests in HTML forms
const upload = multer();

const app = express();
const HTTP_PORT = process.env.PORT || 3838;

// Set up the Cloudinary configuration
cloudinary.config({
    cloud_name: 'dhexphwrx',
    api_key: '354523574636764',
    api_secret: 'MLBZMyiK3CiA8rDb4muJXedPcqs',
    secure: true
});

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

// Route for the "/about" page
app.get("/about", (req, res) => {
    res.render("about");
});

// Route for the "/categories" page
app.get("/categories", (req, res) => {
    storeData.getCategories()
        .then(data => {
            res.render("categories", { categories: data });
        })
        .catch(() => {
            res.status(404).render("404", { message: "No categories found." });
        });
});


// Route for the "addArticle" page
app.get("/articles/add", (req, res) => {
    storeData.getCategories()
        .then(categories => {
            res.render("addArticle", { categories: categories });
        })
        .catch(() => {
            res.status(404).render("404", { message: "No categories found." });
        })
});

// Route to display the modify article page
app.get("/articles/modify", (req, res) => {
    // Doing the same thing as the "/articles" route, but rendering the modify page
    retArticles = storeData.getArticles();
    retArticles
        .then(articles => {
            return storeData.getCategories()
                .then(categories => {
                    let articlesWithCategoryNames = articles.map(article => ({
                        ...article,
                        categoryName: categories.find(cat => cat.id === article.category).Name
                    }));
                    res.render("modifyArticle", {
                        articles: articlesWithCategoryNames,
                        categories: categories
                    });
                })
        })
        .catch(() => {
            res.status(404).render("404", { message: "Failed to load articles or categories" });
        });
});

// Get articles by ID
app.get("/articles/:id", (req, res) => {
    storeData.getArticlesById(req.params.id)
        .then(article => {
            if (!article) {
                // If the article is not found, show the 404 page
                res.status(404).render("404", { message: "Article not found." });
                return;
            }
            // Add category name and convert published status for rendering
            const articleWithCategoryName = storeData.addCategoryToArticle(article);
            res.render("article", { article: articleWithCategoryName });
        })
        .catch(() => {
            res.status(404).render("404", { message: `Article with ID ${req.params.id} not found.` });
        });
});

// Route for the "/articles" page
app.get("/articles", (req, res) => {
    const { category, minDate } = req.query;
    
    // Get articles return based on the query parameters
    if (category) {
        retArticles = storeData.getArticlesByCategory(category);
    } else if (minDate) {
        retArticles = storeData.getArticlesByMinDate(minDate);
    } else {
        retArticles = storeData.getArticles();
    }
    
    retArticles
        .then(articles => {
            return storeData.getCategories()
                .then(categories => {
                    let articlesWithCategoryNames = articles.map(article => ({
                        ...article,
                        categoryName: categories.find(cat => cat.id === article.category).Name
                    }));
                    res.render("articles", {
                        articles: articlesWithCategoryNames,
                        categories: categories
                    });
                })
        })
        .catch(() => {
            res.status(404).render("404", { message: "Failed to load articles or categories" });
        });
});

/* Modify the article */
// Update specific article by ID
app.put("/articles/:id", upload.single("featureImage"), (req, res) => {
    let imageUrl = req.body.currentImage;

    // Update the image to the cloudinary storage if it is valid
    const processUpdate = () => {
        if (req.file) {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result.url);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        }
        return Promise.resolve(imageUrl);
    };

    processUpdate()   
        .then(imageUrl => {
            // Create an object to store the updated article data
            const articleData = {
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                category: req.body.category,
                published: req.body.published === true || req.body.published === 'true',
                featureImage: imageUrl,
                articleDate: new Date()
        };
        
        // Call the function to update the article and return
        return storeData.updateArticle(req.params.id, articleData);
    })
    .then(updatedArticle => {
        res.json(updatedArticle);
    })
    .catch(() => {
        res.status(404).json({ message: "Failed to update article" });
    });
});


// Get the article when user clicks on the "Edit" button
app.get("/api/articles/:id", (req, res) => {
    storeData.getArticlesById(req.params.id)
        .then(article => {
            res.json(article);
        })
        .catch(() => {
            res.status(404).render("404", { message: "Article not found"});
        });
});


// Delete specific article by ID
app.delete("/articles/:id", (req, res) => {
    storeData.deleteArticle(req.params.id)
        .then(() => {
            res.json({ message: "Article deleted successfully" });
        })
        .catch(() => {
            res.status(404).json("404", { message: "Failed to delete article" });
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
                });

                // Store the file content into a buffer, then convert it to a stream and upload it to  Cloudinary storage
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
            .catch(() => res.status(404).render("404", { message: "Image upload failed" }));
        
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
            .catch(() => res.status(404).render("404", { message: "Article creation failed" }));
    }
});

/* Helper Functions */
// Get all articles and add category names to each of them
function getArticlesWithCategoryNames(articlePromise, res) {
    articlePromise
        .then(articles => {
            return storeData.getCategories()
                .then(categories => {
                    let articlesWithCategoryNames = articles.map(article => ({
                        ...article,
                        categoryName: categories.find(cat => cat.id === article.category).Name
                    }));
                    res.render("articles", {
                        articles: articlesWithCategoryNames,
                        categories: categories
                    });
                })
        })
        .catch(() => {
            res.status(404).render("404", { message: "Failed to load articles or categories" });
        });
};


/* Main Functions */
// Initialize the data in the storeData module, then start the server
storeData.initialize().then(() => {
    app.listen(HTTP_PORT); // Start server and listen on specified port
    console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;
