import * as express from 'express';
import { connection, ObjectId } from './../database';
import { random } from './../utils';

const router = express.Router();

router.post('/create', async (req: express.Request, res: express.Response) => {
  const body = req.body;
  const conn = await connection();
  const results = await conn
    .db()
    .collection('users')
    .save({ username: body.username, password: body.password, apikey: random });
  return res.status(200).json({ success: results.result['ok'] === 1 });
});

router.get('/:userid/delete', async (req: express.Request, res: express.Response) => {
  const conn = await connection();
  if (!req.params.userid) return res.status(400).json({ message: 'Could not find user id' });
  const id = new ObjectId(req.params.userid);
  if (!id) return res.status(400).json({ message: 'Id is invalid' });
  const results = await conn
    .db()
    .collection('users')
    .deleteOne({ _id: id });
  return res.status(200).json({ success: results.deletedCount === 1 });
});

export const Router = router;
