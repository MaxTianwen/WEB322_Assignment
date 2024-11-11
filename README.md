
# News Website / Blog

A simple Node.js API that reads articles from a JSON file and returns only the published articles. Built with Express, this site is ready for local development and can be easily deployed.

## Prerequisites

Make sure you have **Node.js** and **npm** installed on your machine.

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
```

## Running the Server

1. After setting up the project, run the following command to start the server:
   ```bash
   node index.js
   ```

2. Open your browser to navigate to `http://localhost:3838` 
