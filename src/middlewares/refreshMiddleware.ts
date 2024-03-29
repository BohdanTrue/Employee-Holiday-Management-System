import 'dotenv/config';
import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService.js';
import { getEmployeeByJwt } from '../controllers/employee.controller.js'
import { couldStartTrivia } from 'typescript';
import { employee } from '../models/employee.model.js';
import { token } from '../models/token.js';

export const refreshMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { access_token, refreshToken } = req.cookies;
    console.log(req.cookies)
    console.log('refMiddleware accesToken: ' + access_token)
    console.log('refMiddleware refToken: ' + refreshToken)

    if (!refreshToken) {
      res.redirect('/');
      return;
    }

    if (refreshToken && access_token) {
      return next();
    }

    const currentToken: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    
    const employeeId = currentToken.userId;
    console.log('employeeId ' + employeeId);

    const currentEmployee = await employee.findOne({where: {id : employeeId }})

    console.log("currentEmployee = " + JSON.stringify(currentEmployee));
    
    const accessToken = jwtService.generateAccessToken(currentEmployee);
    console.log('refMiddleware NEW accesToken: ' + access_token)
    
    res.cookie('access_token', accessToken, {
      maxAge: 5 * 1000,
      httpOnly: true
    });

    res.redirect(req.originalUrl);
  } catch (error) {
    console.error('Error in refreshMiddleware:', error);
    res.status(401).send('Unauthorized');
  }
};