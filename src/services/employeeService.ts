import { ObjectId } from 'mongodb';
import Employee from '../models/employee';
import { collections } from '../utils/database';

export default class EmployeeService {

   async getAll(): Promise<Employee[]> {
    return await collections.employee?.find({}).toArray() as Employee[];
  }

  async add(name: String, remainingHolidays: String): Promise<void> {
    const newEmployee = {
      name: name,
      remainingHolidays: remainingHolidays,
    }
    await collections.employee?.insertOne(newEmployee);
  }

  async getById(id: ObjectId): Promise<Employee>{
    return await collections.employee?.findOne({ _id: id}) as Employee;
  }
}
