import express from 'express';
import { ObjectId } from 'mongodb';
import HolidayRequestService from '../services/holidayRequestService.js';
import EmployeeService from '../services/employeeService.js';
import { holidayRequestController } from '../controllers/holidayRequest.controller.js';
import { employeeController } from '../controllers/employee.controller.js';

const requestRouter = express.Router();
const holidayRequestService = new HolidayRequestService();
const employeeService = new EmployeeService();

requestRouter.get('/requests', async (req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;

  const employees = selectedDatabase === 'postgres' 
    ? await employeeController.getAll(req, res) 
    : await employeeService.getAll();

const holidayRequests = selectedDatabase === 'postgres' 
  ? await holidayRequestController.getAll() 
  : await holidayRequestService.getAll();

const template = selectedDatabase === 'postgres' ? 'requestsForSQL' : 'requests';

res.status(200).render(template, { holidayRequests, employees });
});

requestRouter.get('/add-request', async(req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;

  let employees = selectedDatabase === 'postgres' 
    ? await employeeController.getAll(req, res) 
    : await employeeService.getAll();

  res.status(200).render('add-request', { employees, statusCode: res.statusCode} );
});

requestRouter.post('/add-request', async (req, res) => {
  const name = req.body.name;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const selectedDatabase = process.env.SELECTED_DATABASE;

  const errorMessage = selectedDatabase === 'postgres' ? 
    await holidayRequestController.add(name, startDate, endDate) :
    await holidayRequestService.add(name, startDate, endDate);

  const employees = selectedDatabase === 'postgres' ?
    await holidayRequestController.getAll() :
    await employeeService.getAll();

  if (errorMessage === null) {
    res.redirect('/requests');
  } else {
    res.status(400).render('add-request', { employees, errorMessage, statusCode: res.statusCode });
  }
});

requestRouter.post('/approve-request/:id', async (req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const id = parseInt(req.params.id);

  try {
    if (selectedDatabase === 'postgres') {
      await holidayRequestController.updateStatus(id, 'approved');
    } else {
      await holidayRequestService.updateStatus(new ObjectId(id), 'approved');
    }
    res.status(200).redirect('/requests');
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.post('/reject-request/:id', async(req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const id = parseInt(req.params.id);

  try {
    if (selectedDatabase === 'postgres') {
      await holidayRequestController.updateStatus(id, 'rejected');
    } else {
      await holidayRequestService.updateStatus(new ObjectId(id), 'rejected');
    }
    res.status(200).redirect('/requests');
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.post('/delete-request/:id', async(req, res) => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const id = parseInt(req.params.id);

  try {
    if (selectedDatabase === 'postgres') {
      await holidayRequestController.deleteRequest(id);
    } else {
      await holidayRequestService.delete(new ObjectId(id));
    }
    res.redirect('/requests');
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.get('/update-request/:id', (req, res) => {
  const id = req.params.id;
  res.status(200).render('update-request', { id });
})

requestRouter.post('/update-request/:id', async (req, res) =>{
  const selectedDatabase = process.env.SELECTED_DATABASE;
  try {
    const id = selectedDatabase === 'postgres' ? parseInt(req.params.id) : new ObjectId(req.params.id);
    const errorMessage = selectedDatabase === 'postgres' 
      ? await holidayRequestController.updateRequest(req.params.id, req.body.startDate, req.body.endDate) 
      : await holidayRequestService.updateRequest(req.params.id, req.body.startDate, req.body.endDate);
  
    if (errorMessage === null) {
      res.redirect('/requests');
    } else {
      res.status(400).render('update-request', { id, errorMessage, statusCode: res.statusCode });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default requestRouter;
