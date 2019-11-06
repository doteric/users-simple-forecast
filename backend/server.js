const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");

require('dotenv').config();
if (process.env.ENV_OK !== "yes") {
  throw new Error('The .env file is not included.');
}

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Modify this to your needs.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'test',
  maxAge: new Date(Date.now() + 3600000),
  resave: true,
  saveUninitialized: false
});
app.use(sessionMiddleware);

/* REQUESTS START */
import paths from './paths.js';
app.use('/', paths());
/* REQUESTS END */

const server = app.listen(port, () => console.log(`Listening on port ${port}`));