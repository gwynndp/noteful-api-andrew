const express = require('express');
const xss = require('xss');
const logs = require('../logs');

const notesRouter = express.Router();
const bodyParser = express.json();
const NotesService = require('./notes-service');

const serializeNote = (note) => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  folder_id: note.folder_id,
  date_created: note.date_created
});

notesRouter
  .route('/api/notes')
  .get((req, res, next) => {
    const db = req.app.get('db');
    NotesService.getAllNotes(db)
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['note_name', 'content', 'folder_id']) {
      if (!req.body[field]) {
        logs.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `Missing '${field}' request in body` }
        });
      }
    }

    const { note_name, content, folder_id } = req.body;

    const newNote = { note_name, content, folder_id };

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        logs.info(`Note with id ${note.id} created.`);
        res
          .status(201) //created
          .location(`/api/notes/${note.id}`)
          .json(serializeNote(note));
      })
      .catch(next);

  });

notesRouter
  .route('/api/notes/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    NotesService.getById(req.app.get('db'), id)
      .then(note => {
        if (!note) {
          logs.error(`Note with id ${id} not found`);
          return res.status(404).json({
            error: { message: 'Note Not Found' }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    NotesService.deleteNote(
      req.app.get('db'),
      id
    )
      .then(numRowsAffected => {
        logs.info(`Note with id ${id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { note_name, content, folder_id } = req.body;
    const noteToUpdate = { note_name, content, folder_id };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: 'Request body must contain either \'note_name\', \'content\' or \'folder_id\'' }
      });
    }

    NotesService.updateNote(
      req.app.get('db'),
      req.params.id,
      noteToUpdate
    )
      .then(noteToUpdate => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;