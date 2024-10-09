const { json } = require("express");
const fs = require("fs");
const articles = [];
const categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        // Read articles.json
        fs.readFile('./data/articles.json', 'utf8', (err, data) => {
            if (err) {
                reject(`unable to read articles.json!`);
            } else {
                articles = json.parse(data);

                // Read categories.json 
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(`unable to read categories.json!`);
                    } else {
                        categories = json.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

function getAllArticles() {
    return new Promise((resolve, reject) => {
        // Check if the length is 0 and return the articles array
        if (articles.length > 0) {
            resolve(articles);
        } else {
            reject(`No results returned!`);
        }
    })
}

function getPublishedArticles() {
    return new Promise((resolve, reject) => {
        // Get the articles with published is true
        const pubArticles = articles.filter((article) => {
            articles.published === true;
        });

        // Check the length of the array is 0
        if (pubArticles.length > 0) {
            resolve(pubArticles);
        } else {
            reject(`No results returned!`);
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("no results returned");
        }
    });
}
