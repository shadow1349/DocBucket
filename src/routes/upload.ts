import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

const router = express.Router();
const defaultFolder = process.env.DEFAULT_FOLDER || 'DocBucket';
const staticFolder = `${path.join(__dirname, '../../')}/${defaultFolder}`;

router.post('/', async (req: express.Request, res: express.Response) => {
  if (!req['files']) return res.status(400).json({ message: 'No files were uploaded' });
  if (!req.query.path) return res.status(400).json({ message: 'No upload path was provided' });

  if (!fs.existsSync(path.join(staticFolder, req.query.path)))
    fs.mkdirSync(path.join(staticFolder, req.query.path));

  if (req['files'].upload.length > 0) {
    req['files'].forEach(file => {
      file.mv(path.join(staticFolder, req.query.path, file.name));
    });
  } else {
    req['files'].upload.mv(path.join(staticFolder, req.query.path, req['files'].upload.name));
  }

  return res.status(200).json({ message: 'Files Uploaded Successfully' });
});

router.get('/createfolder', async (req: express.Request, res: express.Response) => {
  const folder = req.query.path;
  if (!folder) return res.status(400).json({ message: 'No upload folder was provided' });
  if (!fs.existsSync(path.join(staticFolder, folder))) {
    fs.mkdirSync(path.join(staticFolder, folder));
    return res.status(200).json({ success: true });
  } else return res.status(200).json({ success: false, message: 'This folder already exists' });
});

export const Router = router;
