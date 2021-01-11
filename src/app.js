require('dotenv').config();
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet'),
  { NODE_ENV } = require('./config');

const foldersRouter = require('./folders/folders-router');
const notesRouter = require('./notes/notes-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app
  .use(morgan(morganOption))
  .use(helmet())
  .use(cors())
  .use(express.json())
  .use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } };
    } else {
      console.error(error);
      response = { message: error.message, error };
    }
    res.status(500).json(response);
  });

app.use(foldersRouter);
app.use(notesRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

module.exports = app;