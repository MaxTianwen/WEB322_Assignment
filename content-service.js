/*
Name: Tianwen Wang
Student ID: 151583226
Email: twang118@myseneca.ca
Created: 2024/10/06
Last Modified: 2024/10/10 
*/

const { json } = require("express");
const fs = require("fs");
let articles = [];
let categories = [];
const path = require('path');

function initialize() {
    return new Promise((resolve, reject) => {
        // Read articles.json
        fs.readFile(path.join(__dirname + '/data/articles.json'), 'utf8', (err, data) => {
            if (err) {
                reject(`unable to read articles.json!`);
            } else {
                articles = JSON.parse(data);
                // Read categories.json 
                fs.readFile(path.join(__dirname + '/data/categories.json'), 'utf8', (err, data) => {
                    if (err) {
                        reject(`unable to read categories.json!`);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

function getPublishedArticles() {
    return new Promise((resolve, reject) => {
        // Get the articles with published is true
        const pubArticles = articles.filter((article) => {
            return article.published === true;
        });

        // Check the length of the array is 0
        if (pubArticles.length > 0) {
            resolve(pubArticles);
        } else {
            reject(`No results returned!`);
        }
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

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("no results returned");
        }
    });
}

// Export the functions for other modules
module.exports = { initialize, getPublishedArticles, getAllArticles, getCategories };
