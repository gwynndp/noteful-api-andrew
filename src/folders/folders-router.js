const express = require('express');
const xss = require('xss');
const logs = require('../logs');

const foldersRouter = express.Router();
const bodyParser = express.json();
const FoldersService = require('./folders-service');

const serializeFolder = (folder) => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
  date_created: folder.date_created
});

foldersRouter
  .route('/api/folders')
  .get((req, res, next) => {
    const db = req.app.get('db');
    FoldersService.getAllFolders(db)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    if (!req.body['folder_name']) {
      logs.error('folder_name is requried');
      return res.status(400).send({
        error: { message: 'Missing folder_name in request body' }
      });
    }

    const { folder_name } = req.body;

    const newFolder = { folder_name };

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        logs.info(`Folder with id ${folder.id} created.`);
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/api/folders/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    FoldersService.getById(req.app.get('db'), id)
      .then(folder => {
        if (!folder) {
          logs.error(`Folder with id ${id} not found`);
          return res.status(404).json({
            error: { message: 'Folder Not Found' }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    FoldersService.deleteFolder(req.app.get('db'), id)
      .then(numRowsAffected => {
        logs.info(`Folder with id ${id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };

    if (Object.keys(folderToUpdate).length < 1) {
      return res.status(400).json({
        error: { message: 'Request must contain a folder_name' }
      });
    }

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.idm,
      folderToUpdate
    )
      .then(folderToUpdate => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;