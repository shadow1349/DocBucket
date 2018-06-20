import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { connection } from './../database';
import { random } from './../utils';

const router = express.Router();
const defaultFolder = process.env.DEFAULT_FOLDER || 'DocBucket';
const staticFolder = `${path.join(__dirname, '../../')}/${defaultFolder}`;

router.post('/', async (req: express.Request, res: express.Response) => {
  if (!req['files'])
    return res.status(400).json({ success: false, message: 'No files were uploaded' });
  if (!req.query.path)
    return res.status(400).json({ success: false, message: 'No upload path was provided' });

  if (!fs.existsSync(path.join(staticFolder, req.query.path))) {
    fs.mkdirSync(path.join(staticFolder, req.query.path));
    const conn = await connection();
    conn
      .db()
      .collection('folders')
      .save({
        path: path.join(staticFolder, req.query.path.toLowerCase()),
        name: path.basename(req.query.path.toLowerCase())
      });
  }

  const conn = await connection();

  if (req['files'].upload.length > 0) {
    req['files'].forEach(file => {
      conn
        .db()
        .collection('files')
        .save({ key: random, path: path.join(req.query.path, file.name), ispublic: false });
      file.mv(path.join(staticFolder, req.query.path, file.name));
    });
  } else {
    conn
      .db()
      .collection('files')
      .save({
        key: random,
        path: path.join(req.query.path, req['files'].upload.name),
        ispublic: false
      });
    req['files'].upload.mv(path.join(staticFolder, req.query.path, req['files'].upload.name));
  }

  return res.status(200).json({ message: 'Files Uploaded Successfully' });
});

router.get('/createfolder', async (req: express.Request, res: express.Response) => {
  const folder = req.query.path;
  if (!folder)
    return res.status(400).json({ success: false, message: 'No upload folder was provided' });
  if (!fs.existsSync(path.join(staticFolder, folder.toLowerCase()))) {
    fs.mkdirSync(path.join(staticFolder, folder.toLowerCase()));
    const conn = await connection();

    const result = conn
      .db()
      .collection('folders')
      .findOne({ path: path.join(staticFolder, folder.toLowerCase()) });
    if (result)
      return res.status(200).json({ success: false, message: 'This folder already exists' });

    conn
      .db()
      .collection('folders')
      .save({ path: path.join(staticFolder, folder.toLowerCase()), name: folder.toLowerCase() });

    return res.status(200).json({ success: true });
  } else return res.status(200).json({ success: false, message: 'This folder already exists' });
});

router.get('/createbucket', async (req: express.Request, res: express.Response) => {
  const bucket = req.query.bucket;
  if (!bucket)
    return res.status(400).json({ success: false, message: 'Please enter a bucket to create' });

  const conn = await connection();

  const result = await conn
    .db()
    .collection('buckets')
    .findOne({ name: req.query.bucket.toLowerCase() });

  if (result)
    return res.status(200).json({ success: false, message: 'This bucket already exists' });

  const createResult = await conn
    .db()
    .collection('buckets')
    .save({ name: req.query.bucket.toLowerCase(), path: `/${req.query.bucket.toLowerCase()}` });

  if (createResult.result['ok'] !== 1) {
    return res
      .status(200)
      .json({ success: false, message: 'Bucket could not be created right now' });
  }
  return res.status(200).json({ success: true, message: 'Bucket created successfully' });
});

export const Router = router;
