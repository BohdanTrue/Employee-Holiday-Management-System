import express from 'express';
import { ObjectId } from 'mongodb';
import HolidayRequestService from '../services/holidayRequestService';
import EmployeeService from '../services/employeeService';

const requestRouter = express.Router();
const holidayRequestService = new HolidayRequestService();
const employeeService = new EmployeeService();

requestRouter.get('/requests', async (req, res)  => {
  const employees = await employeeService.getAll();
  const holidayRequests = await holidayRequestService.getAll();
  res.status(200).render('requests', { holidayRequests, employees });
});

requestRouter.get('/add-request', async(req, res)  => {
  const employees = await employeeService.getAll();
  res.status(200).render('add-request', { employees, statusCode: res.statusCode} );
});

requestRouter.post('/add-request', async (req, res) => {
  const errorMessage = await holidayRequestService.add(req.body.name, req.body.startDate, req.body.endDate);
  if (errorMessage === null){
   res.redirect('/requests');
  } else {
    const employees = await employeeService.getAll();
    res.status(400).render('add-request', {employees, errorMessage, statusCode: res.statusCode});
  }
}); 

requestRouter.post('/approve-request/:id', async (req, res)  => {  
  await holidayRequestService.updateStatus(new ObjectId(req.params.id), 'approved');
  res.redirect('/requests');
});

requestRouter.post('/reject-request/:id', async(req, res)  => {
  await holidayRequestService.updateStatus(new ObjectId(req.params.id), 'rejected');
  res.redirect('/requests');
});

requestRouter.post('/delete-request/:id', async(req, res) => {  
  await holidayRequestService.delete(new ObjectId(req.params.id));
  res.redirect('/requests');
});

requestRouter.get('/update-request/:id', (req, res) => {
  const id = req.params.id;
  res.status(200).render('update-request', {id});
})

requestRouter.post('/update-request/:id', async (req, res) =>{
  const errorMessage = await holidayRequestService.updateRequest(req.params.id, req.body.startDate, req.body.endDate);
  if(errorMessage === null){
      res.redirect('/requests');
  } else {
    const id = new ObjectId(req.params.id)
    res.status(400).render('update-request', {id, errorMessage, statusCode: res.statusCode});
  }
});

export default requestRouter;
