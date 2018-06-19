import * as express from 'express';
import { connection } from './../database';
import { random } from './../utils';

const router = express.Router();

router.post('/create', async (req: express.Request, res: express.Response) => {
  const body = req.body;
  const conn = await connection();
  const results = await conn
    .db()
    .collection('users')
    .save({ username: body.username, password: body.password, apikey: random });
  return res.status(200).json({ results: results });
});

export const Router = router;
