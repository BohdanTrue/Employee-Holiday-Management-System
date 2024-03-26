import express from 'express';
import EmployeeService from '../services/employeeService';

const employeeRouter = express.Router();
const employeeService = new EmployeeService;

employeeRouter.get('/add-employee', (req, res)  => {
  res.status(200).render('add-employee');
});

employeeRouter.post('/add-employee', async (req, res) => {
  await employeeService.add(req.body.name, req.body.remainingHolidays);
  res.redirect('employees');
});

employeeRouter.get('/employees', async(req, res)  => {
  const employees = await employeeService.getAll();
  res.status(200).render('employees', { employees });
});

export default employeeRouter;
