import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as cors from 'cors';
import { connection } from './database';
import { random } from './utils';
dotenv.config();

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

app.use(
  '/:apikey',
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const conn = await connection();
    const result = conn
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

server.listen(port, async () => {
  const conn = await connection();
  const result = await conn
    .db()
    .collection('users')
    .findOne({ _id: 1 });
  if (!result) {
    conn
      .db()
      .collection('users')
      .save({ _id: 1, username: 'root', password: 'D0cBucket!', apikey: random });
  }
  console.log(`DocBucker Server Started On Port ${port}`);
});
