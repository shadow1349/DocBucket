import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as cors from 'cors';
import { connection } from './database';
import { random } from './utils';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();
const defaultFolder = process.env.DEFAULT_FOLDER || 'DocBucket';
const staticFolder = `${path.join(__dirname, '../')}/${defaultFolder}`;

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
const corsOptions: cors.CorsOptions = {
  origin: true
};

app.use(cors(corsOptions));
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/buckets', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const file = path.basename(req.url);
  console.log(file);
  return next();
});
app.use('/buckets', express.static(staticFolder));

app.use(
  '/:apikey',
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const conn = await connection();
    const result = await conn
      .db()
      .collection('users')
      .findOne({ apikey: req.params.apikey });
    if (!result)
      return res.status(401).json({ message: 'You are not authorized to access this route' });
    else return next();
  }
);

//User Routes
import * as userRoute from './routes/users';
userRoute.Router.options('*', cors(corsOptions));
app.use('/:apikey/users', userRoute.Router);

//Upload Route
import * as uploadRoute from './routes/upload';
uploadRoute.Router.options('*', cors(corsOptions));
app.use('/:apikey/upload', uploadRoute.Router);

server.listen(port, async () => {
  if (!fs.existsSync(path.join(staticFolder, 'default')))
    fs.mkdirSync(path.join(staticFolder, 'default'));

  const conn = await connection();
  const result = await conn
    .db()
    .collection('users')
    .findOne({ _id: 1 });

  if (!result)
    conn
      .db()
      .collection('users')
      .save({ _id: 1, username: 'root', password: 'D0cBucket!', apikey: random });

  console.log(`DocBucker Server Started On Port ${port}`);
});
