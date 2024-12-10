# WEB322 Assignments

A simple Node.js API that reads articles from a JSON file and returns only the published articles. Built with Express, this site is ready for local development and can be easily deployed.

## Vercel URL

https://web-322-assignment-theta.vercel.app/  
https://web-322-assignment-git-main-tianwen-wangs-projects.vercel.app/  
https://web-322-assignment-ctw76f3g6-tianwen-wangs-projects.vercel.app/

## Prerequisites

Make sure you have **Node.js**, **npm**, and a **Neon.tech** account to set up your PostgreSQL database.

## Setting Up the Database

1. **Create a Neon.tech account**: Visit [Neon.tech](https://neon.tech) and sign up for a free account.  

2. **Create a new project**: After logging in, create a new project and give it a meaningful name (e.g., `new_project`).  

3. **Create a database**: Create a new database called `blog_database`.  

4. **Obtain Database Credentials**: From your Neon.tech dashboard, copy the following connection details:
    - Host  
    - Database name  
    - Username  
    - Password  
    - Port (default is 5432)  
5. **Create Tables**: Use the SQL editor in Neon.tech or a PostgreSQL client like DBeaver or pgAdmin to create the following tables:  

    - **Categories Table**: To store categories.
    - **Articles Table**: To store articles.

### Example SQL for Creating Tables

All the tables are created using pgAdmin4.  

If you want to create tables using JS, plz reference the following example code:  

```sql
-- Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories
(
    id integer NOT NULL,
    "Name" character varying COLLATE pg_catalog."default",
    CONSTRAINT categories_pkey PRIMARY KEY (id)
)

-- Create Articles Table
CREATE TABLE IF NOT EXISTS public.articles
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 6 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    content character varying COLLATE pg_catalog."default",
    author character varying COLLATE pg_catalog."default",
    published boolean,
    category integer,
    "articleDate" date,
    "featureImage" character varying COLLATE pg_catalog."default",
    CONSTRAINT articles_pkey PRIMARY KEY (id)
)
```

## Installation

1. Install the dependencies:

```bash
npm install
```

## Available Scripts

In the project directory, you can run:

```bash
node index.js
```

### `index.js` Setup

The `index.js` file reads from the `articles.json` and `categories.json` file located in the `data` folder and serves API routes using Express.

### Required Packages

Install these packages if not already done via `npm install`:

```bash
npm install express
npm install ejs
npm install pg
npm install multer
npm install method-override
npm install streamifier
```

## Configure Database Credentials:

Set up environment variables for the PostgreSQL credentials you obtained from Neon.tech:  

DB_HOST  
DB_NAME  
DB_USER  
DB_PASSWORD  
DB_PORT (default is 5432)  

You can create a .env file in the root directory of your project for this purpose:  

DB_HOST=your_neon_host  
DB_NAME=blog_database  
DB_USER=your_neon_user  
DB_PASSWORD=your_neon_password  
DB_PORT=5432  


## Database Set Up

1. Configure PostgreSQL Connection:
In content-service.js, configure the connection to PostgreSQL using the pg package and Neon.tech credentials.  

2. Refactor Functions:
Replace all JSON-based data handling with PostgreSQL queries.

3. CRUD Operations:
All CRUD routes (GET, POST, PUT, DELETE) have been updated to interact with the PostgreSQL database.

4. Routes Refactoring:  
GET /articles: Fetches all articles from the PostgreSQL database.  
GET /categories: Fetches all categories from the PostgreSQL database.  
POST /articles/add: Adds a new article to the database.  
PUT /articles/:id: Updates an article in the database.  
DELETE /articles/:id: Deletes an article from the database.  

5. PGadmin 4:  
Adding data to the database can be done either using JS or by converting json file to .csv and adding in PGadmin4


## Running the Server

1. After setting up the project, run the following command to start the server:

```bash
node index.js
```

2. Open your browser to navigate to `http://localhost:3838`

## Revisions:

1. Modified Articles route and use EJS module.

2. Updated Categories pages to show the correct category name based on user's choice.

3. Added Article page to view each single article properly.

4. Optimized pages style.

5. Converted all the data into tables in PostgreSQL.
