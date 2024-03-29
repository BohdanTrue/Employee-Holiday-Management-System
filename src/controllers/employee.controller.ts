import jwt, { Secret } from 'jsonwebtoken';
import { employee } from "../models/employee.model.js";
import { Request, Response } from 'express';
import { genPassword, validPassword } from "../utils/passwordUtils.js";
import { jwtService } from "../services/jwtService.js";
import { tokenService } from "../services/tokenService.js";
import fs from 'fs';
import path from 'path';

// const pathToKey = path.join(process.cwd(), 'id_rsa_priv.pem');
// const SECRET_KEY = fs.readFileSync(pathToKey, 'utf8');
// const REFRESH_KEY = 'adsadasfdavs'; ////12312321321321

const add = async (req: Request, res: Response) => {
  const { username, password, isAdmin } = req.body;
  const remainingHolidays = 20;
  let role = isAdmin !== undefined ? 'admin' : 'employee';

  const existingEmployee = await employee.findOne({ where: { username } });
  if (existingEmployee) {
    return res.status(400).send(`
      <p>Employe with name: ${username} already exists</p>
      <button onclick="window.history.back()">Back</button>
    `);
  }

  const saltHash = genPassword(password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  await employee.create({username, remainingHolidays, hash, salt, role});
}

const getAll = async (req: Request, res: Response) => {
  const employees =  await employee.findAll();
  return employees;
}

const getById = async(id: number) => {
  try {
    return await employee.findOne({where: {id}});
  } catch (error) {
    console.error('Error retrieving employee by ID:', error);
    throw error;
  }
}

const login = async(req: Request, res: Response) => {
  const existingEmployee: any = await employee.findOne({ where: {username: req.body.username}});

  if (!existingEmployee) {
    return res.status(401).render('login', {error: 'could not find the user', statusCode: res.statusCode});
  }

  const isPasswordValid = validPassword(req.body.password, existingEmployee.hash, existingEmployee.salt);

  if (!isPasswordValid) {
    return res.status(401).render('login', {error: 'wrong username or password', statusCode: res.statusCode});
  }

  await generateTokens(res, existingEmployee);
  return res.status(200).redirect('/');
};

const logout = async(req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refreshToken');
  res.redirect('/');
}

export const getEmployeeByJwt = async (token: string) => {
  try {
    const decodedToken: any = jwt.decode(token);
    
    const employeeId: any = decodedToken.userId;
    const currentEmployee = await employee.findOne({
      where: {id : parseInt(employeeId)}
    });
    console.log("employee " + currentEmployee);
    return currentEmployee;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

async function generateTokens(res: Response, employee: any) {
  const accessToken = jwtService.generateAccessToken(employee);
  const refreshToken = jwtService.generateRefreshToken(employee);
  
  await tokenService.save(employee.id, refreshToken);
  
  res.cookie('refreshToken', refreshToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.cookie('access_token', accessToken, {
    maxAge: 5 * 1000,
    httpOnly: true,
    sameSite: true
  });
}

export const employeeController = {
  add, getAll, getById, login, logout, getEmployeeByJwt
}
