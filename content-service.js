// Import the 'fs' module for interacting with the file system
const fs = require("fs");

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
  return Promise.resolve(articles
    .filter(article => article.published)) // Return only articles with `published: true`
    .map(article => convertPublishedToYesNo(addCategoryToArticle(article)) // Add category name to each article
  );
}

// Function to get all categories
function getCategories() {
  return Promise.resolve(categories); // Return the categories array as a resolved promise
}

// Function to get all articles
function getArticles() {
  return Promise.resolve(articles
    .map(article => convertPublishedToYesNo(addCategoryToArticle(article))) // Add category name to each article
  );
}

// Function to get articles by category
function getArticlesByCategory(category) {
  return new Promise((resolve, reject) => {
    // Filter the articles array to get only articles with the specified category
    const filteredArticles = articles
      .filter(article => article.category === Number(category))
      .map(article => convertPublishedToYesNo(addCategoryToArticle(article))); // Add category name to each article
    
    if (filteredArticles.length > 0) {
      resolve(filteredArticles);
    } else {
      reject("no results returned");
    }
  });
};

// Function to get articles by min date
function getArticlesByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    // Filter the articles array to get articles that are newer than the specified min date
    const minDate = new Date(minDateStr);
    const filteredArticles = articles
      .filter(article => new Date(article.articleDate) >= minDate)
      .map(article => convertPublishedToYesNo(addCategoryToArticle(article)));// Add category name to each article

    // Check if the filtered articles array has any results
    if (filteredArticles.length > 0) {
      resolve(filteredArticles);
    } else {
      reject("no results returned");
    }
  });
};

// Function to get articles by ID
function getArticlesById(id) {
  return new Promise((resolve, reject) => {
    // Check if the article with the input ID exists in the articles array
    const foundArticle = articles.find(article => article.id === Number(id));
    if (foundArticle) {
      resolve(convertPublishedToYesNo(addCategoryToArticle(foundArticle)));
    } else {
      reject("no results returned");
    }
  });
};


/* Modifiers */
// Function to add a new article
function addArticle(article) {
  return new Promise((resolve, reject) => {
    // Check if the new article is published and set a new id for it
    article.published = article.published ? true : false;
    article.id = articles.length + 1;

    // Push the new article to the articles array
    articles.push(article);
    resolve(article => convertPublishedToYesNo(addCategoryToArticle(article)));
  });
};


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

// Display the published column with "Yes" or "No" instead of true or false
function convertPublishedToYesNo(article) {
  return {
    ...article,
    published: article.published ? "Yes" : "No"
  };
}

/* Exports */
// Export the functions as an object to make them available to other files
module.exports = { initialize, getCategories, getArticles, addArticle, getPublishedArticles, getArticlesByCategory, getArticlesByMinDate, getArticlesById, addCategoryToArticle, convertPublishedToYesNo };
