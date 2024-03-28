import express, { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import employeeRouter from './src/routers/employeeRouter.js';
import requestRouter from './src/routers/requestRouter.js';
import authRouter from './src/routers/authRouter.js';
import publicHolidayRouter from './src/routers/publicHolidayRouter.js';
import { connectToDatabase } from './src/utils/database.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT: number = parseInt(process.env.PORT!);
const HOST: string = process.env.HOST!;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use('/', employeeRouter);
app.use('/', requestRouter);
app.use('/', authRouter);
app.use('/public-holidays', publicHolidayRouter);

app.get('/', (req, res) => res.status(200).render('index', { db: process.env.SELECTED_DATABASE }));

app.get('*', (req, res)  => {
  res.status(404).render('error');
});

app.post('/set-database', (req, res) => {
  const newDatabase = req.body.database;
  process.env.SELECTED_DATABASE = newDatabase;
  console.log("Selected database:", newDatabase);
  res.redirect('/');
});

app.listen(PORT, HOST, async () => {
 connectToDatabase();
  console.log(`Server started: http://${HOST}:${PORT}`);
});
