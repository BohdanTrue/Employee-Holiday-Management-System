import express from 'express';
import path from 'path';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import employeeRouter from './src/routers/employeeRouter.js';
import requestRouter from './src/routers/requestRouter.js';
import authRouter from './src/routers/authRouter.js';
import publicHolidayRouter from './src/routers/publicHolidayRouter.js';
import { connectToDatabase } from './src/utils/database.js';
import { ConfiguratePassport } from './src/utils/passport.js';
import { employeeController } from './src/controllers/employee.controller.js';
import EmployeeService from './src/services/employeeService.js';
import { refreshMiddleware } from './src/middlewares/refreshMiddleware.js';
import { jwtService } from './src/services/jwtService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeService = new EmployeeService;
const HOST: string = process.env.HOST!;
const PORT: number = parseInt(process.env.PORT!);

const app = express();
ConfiguratePassport(passport);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  if (req.cookies.access_token){

    const employee = process.env.SELECTED_DATABASE === 'postgres'
      ? await employeeController.getEmployeeByJwt(req.cookies.access_token)
      : await employeeService.getEmployeebyJwt(req.cookies.access_token);
      
    res.status(200).render('index', { db: process.env.SELECTED_DATABASE, employee, access_token: req.cookies.access_token});
  } else {
    res.status(200).render('index', { db: process.env.SELECTED_DATABASE, access_token: req.cookies.access_token});
  }
});

app.use('/', employeeRouter);
app.use('/', requestRouter);
app.use('/', authRouter);
app.use('/public-holidays', publicHolidayRouter);
// app.get('/refresh', refreshMiddleware, employeeController.refresh);

app.get('*', (req, res)  => {
  res.status(404).render('error');
});

app.post('/set-database', (req, res) => {
  const newDatabase = req.body.database;
  process.env.SELECTED_DATABASE = newDatabase;
  res.clearCookie('access_token');
  console.log("Selected database:", newDatabase);
  res.redirect('/');
});

// app.use(refreshMiddleware);

app.listen(PORT, HOST, async () => {
  // await connectToDatabase();
  console.log(`Server started: http://${HOST}:${PORT}`);
});
