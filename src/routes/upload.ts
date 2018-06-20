import * as express from 'express';
import * as fileUpload from 'express-fileupload';
const router = express.Router();
router.use(fileUpload());

router.post('/', async (req: express.Request, res: express.Response) => {
  if (!req['files']) return res.status(400).json({ message: 'No files were uploaded' });
  if (!req.body.path) return res.status(400).json({ message: 'No upload path was provided' });

  console.log(req['files']);

  return res.status(200);
});

export const Router = router;
