import jsonwebtoken from 'jsonwebtoken';
import { employeeController } from '../controllers/employee.controller.js';
import EmployeeService from '../services/employeeService.js';

export function isAuth (req: any, res: any, next: any) {
  if (req.cookies.access_token) {
    return next();
  }
  res.status(401).json({ msg: 'You are not authorized to view this resource' });
}

export function isUnauth (req: any, res: any, next: any) {
  if (!req.cookies.access_token) {
    return next();
  }
  res.status(401).json({ msg: 'You are not authorized to view this resource' });
}

export async function isAdmin (req: any, res: any, next: any) {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const employeeService = new EmployeeService(); 
  const employee: any = selectedDatabase === 'postgres' 
    ? await employeeController.getEmployeeByJwt(req.cookies.access_token.token) 
    : await employeeService.getEmployeebyJwt(req.cookies.access_token.token);
  if (employee.role === 'admin') {
    next();
  } else {
    res.status(401).json({ msg: 'You are havent access to view this resource' });
  }
}


export function getEmployeeIdFromAccessToken(token: string){
  // const [, accessToken] = token.split(' ');
  console.log('token = ' + token)
  const decodedJwt = jsonwebtoken.decode(token);
  console.log('decoded jwt ' + decodedJwt)
  return decodedJwt!.sub!;
}
