import { employee } from "../models/employee.model.js";
import { Request, Response } from 'express';

const add = async (req: Request, res: Response) => {
  const { name, remainingHolidays } = req.body;

  const existingEmployee = await employee.findOne({ where: { name } });
  if (existingEmployee) {
    return res.status(400).send(`
      <p>Employe with name: ${name} already exists</p>
      <button onclick="window.history.back()">Back</button>
    `);
  }
  
  await employee.create({ name, remainingHolidays });
  res.status(200).redirect('employees');
}

const getAll = async (req: Request, res: Response) => {
  const employees =  await employee.findAll();
  console.log(employees);
  
  return employees;
  
}

const getById = async(id: number) => {
  try {
    return await employee.findByPk(id);
  } catch (error) {
    console.error('Error retrieving employee by ID:', error);
    throw error;
  }
}

export const employeeController = {
  add, getAll, getById
}