import { HolidayRequest } from './src/models/holidayRequest';
import express from "express";
import bodyParser from 'body-parser';
import HolidayRequests from './src/storage/holidayRequests';
import { validateHolidayRequest } from './src/utils/validation'
import { Employee } from './src/models/employee';
import Employeers from './src/storage/emplioyeers';
import { getPublicHoildays } from './src/utils/workWithAPI';

const PORT = 3033;
const HOST = 'localhost';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const Requests = new HolidayRequests();
const Employees = new Employeers();

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/add-employee', (req, res)  => {
  res.render('add-employee');
});

var employeeId = 0;
app.post('/add-employee', (req, res) => {
  const newEmployee = new Employee(employeeId++, req.body.name, req.body.remainingHolidays);
  Employees.addEmployee(newEmployee);
  res.redirect('/employees');
});

app.get('/employees', (req, res)  => {
  const employees = Employees.getEmployees();
  res.render('employees', { employees });
});

app.get('/requests', async (req, res)  => {
  const holidayRequests = Requests.getHolidayRequests();  
  const publicHolidays = await getPublicHoildays();
  res.render('requests', { holidayRequests, publicHolidays });
});

app.get('/add-request', (req, res)  => {
  res.render('add-request');
});

var requestId = 0;
app.post('/add-request', async (req, res)  => {
    const holidayRequest = new HolidayRequest( requestId++, parseInt(req.body.employeeId), req.body.startDate, req.body.endDate);
    if (await validateHolidayRequest(holidayRequest, Employees)){
    Requests.addHolidayRequest(holidayRequest);
    res.redirect('/requests');    
    }
    else res.render('add-request')
}); 

app.post('/approve-request/:id', (req, res)  => {
  const request = Requests.getHolidayById(parseInt(req.params.id));
  if (request) {
    request.status = 'approved';
  }  
  res.redirect('/requests');
});

app.post('/reject-request/:id', (req, res)  => {
  const request = Requests.getHolidayById(parseInt(req.params.id));
  if (request) {
    request.status = 'rejected';
  }  
  res.redirect('/requests');
});

app.post('/delete-request/:id', (req, res) => {  
  Requests.deleteHolidayRequests(req.body.id);
  res.redirect('/requests');
});

app.get('/update-request/:id', (req, res) => {
  const id = req.params.id;
  res.render('update-request', {id});
})

app.post('/update-request/:id', async (req, res) =>{
  const id = req.params.id;
  const request = Requests.getHolidayById(parseInt(id));
  if(request){
    request.startDate = req.body.startDate;
    request.endDate = req.body.endDate;
    if(await validateHolidayRequest(request, Employees)){
      res.redirect('/requests');
    }
  }
  res.render('update-request', {id});
})

app.get('*', (req, res)  => {
  res.status(404).render('error');
});

app.get('*', (req, res)  => {
  res.status(404).render('error');
});

app.listen(PORT, HOST, () => {
  console.log(`Server started: http://${HOST}:${PORT}`);
});
