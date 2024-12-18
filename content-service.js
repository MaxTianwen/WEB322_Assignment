// Import the 'fs' module for interacting with the file system
const { error } = require("console");
const fs = require("fs");
// Import Neon.tech database module
const { Pool } = require('pg');
const pool = new Pool({
    user: 'SenecaDB_owner',
    host: 'ep-summer-unit-a50wvl9o.us-east-2.aws.neon.tech',
    database: 'blog_database',
    password: 'w1leTkxd4HUm',
    port: 5432,
    ssl: { rejectUnauthorized: false },
});

// Arrays to store categories and articles data loaded from JSON files
let categories = [];
let articles = [];

/* Initializers */
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

/* Queries */
// Function to get only published articles by filtering the articles array
function getPublishedArticles() {
    return pool.query(
        'SELECT * \
        FROM articles\
        WHERE published = true'
    )
        .then(res => res.rows)
        .catch(() => Promise.reject('No results'));
}

// Function to get all categories
function getCategories() {
    return pool.query('SELECT * FROM categories')
        .then(res => res.rows)
        .catch(() => Promise.reject('No results'));
}

// Function to get all articles
function getArticles() {
    return pool.query('SELECT * FROM articles')
        .then(res => res.rows)
        .catch(() => Promise.reject('No results'));
}

// Function to get articles by category
function getArticlesByCategory(category) {
    return pool.query(
        'SELECT *\
        FROM articles\
        WHERE articles.category = $1', [category]
    )
        .then(res => res.rows)
        .catch(() => Promise.reject('No results'));
}

// Function to get articles by min date
function getArticlesByMinDate(minDateStr) {
    return pool.query(
        'SELECT *\
        FROM articles\
        WHERE articles.articleDate >= $[1]', [minDateStr]
    )
        .then(res => res.rows)
        .catch(() => Promise.reject('No results'));
}

// Function to get articles by ID
function getArticlesById(id) {
    return pool.query(
        `SELECT * FROM articles WHERE id = $1`, [id]
    )
        .then(res => {
            if (res.rows.length === 0) {
                return Promise.reject("No article found");
            }
            return res.rows[0];
        })
        .catch(() => Promise.reject('No results'));
}


/* Modifiers */
// Function to add a new article
function addArticle(article) {
    const query =
        `INSERT INTO articles (title, content, author, category, published, "articleDate", "featureImage")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;
    
    const values = [
        article.title,
        article.content,
        article.author,
        article.category,
        article.published === 'on' ? true : false,
        article.articleDate || new Date(),
        article.featureImage || null
    ];

    return pool.query(query, values)
        .then(res => res.rows[0])
        .catch(() => Promise.reject('Failed to add article'));
}

// Function to update an article by ID
function updateArticle(id, article) {
    const query =
    ` UPDATE articles
    SET 
        title = $1,
        content = $2,
        author = $3,
        category = $4,
        published = $5,
        "articleDate" = $6,
        "featureImage" = $7
    WHERE id = $8
    RETURNING *`;
            
    const values = [
        article.title,
        article.content,
        article.author,
        article.category,
        article.published === true,
        article.articleDate,
        article.featureImage,
        id
    ];
    
    return pool.query(query, values)
        .then(res => {
            if (res.rowCount === 0) {
                return Promise.reject(`No article found with ID: ${id}`);
            }
            return res.rows[0];
        })
        .catch(() => Promise.reject(`Failed to update article with ID: ${id}`));
}


// Function to delete an article by ID
function deleteArticle(id) {
    return pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id])
        .then(res => {
            if (res.rowCount === 0) {
                return Promise.reject('No article found');
            }
            return res.rows[0];
        })
        .catch(() => Promise.reject('Failed to delete article'));
}


/* Helpers */
// Change the category ID to the category name in each article
function addCategoryToArticle(article) {
    const category = categories.find(category => category.id === article.category);
    return {
        ...article,
        categoryName: category.Name,
        category: article.category
    };
}

/* Exports */
// Export the functions as an object to make them available to other files
module.exports = { initialize, getCategories, getArticles, addArticle, getPublishedArticles, getArticlesByCategory, getArticlesByMinDate, getArticlesById, addCategoryToArticle, updateArticle, deleteArticle };
