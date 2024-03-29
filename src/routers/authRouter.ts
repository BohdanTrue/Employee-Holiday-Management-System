import express from 'express';
import { isAuth, isUnauth } from '../utils/authUtils.js';
import EmployeeService from '../services/employeeService.js';
import { employeeController } from '../controllers/employee.controller.js';
import { refreshMiddleware } from '../middlewares/refreshMiddleware.js';
import { jwtService } from '../services/jwtService.js';
import { Response } from 'express-serve-static-core';
import { tokenService } from '../services/tokenService.js';
 
const authRouter = express.Router();
const employeeService = new EmployeeService;

authRouter.get('/register', isUnauth, (req, res) => {
  res.status(200).render('register', {statusCode: res.statusCode});
})

authRouter.post('/register', async (req, res) => {
  if(req.body.password !== req.body.repeatPassword){
    res.status(400).render('register', {msg: 'passwords are not the same', statusCode: res.statusCode});
    return;
  }

  try {
    if (process.env.SELECTED_DATABASE === 'postgres') {
      await employeeController.add(req, res);
    } else {
      await employeeService.add(req, res);
    }

    res.status(200).redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

authRouter.get('/login', (req, res) => {
  return res.status(200).render('login', { statusCode: res.statusCode });
});

authRouter.post('/login', async(req, res) => {
  if (process.env.SELECTED_DATABASE === 'postgres'){  
    await employeeController.login(req, res); 
  } else {
    await employeeService.login(req, res);
  }
})

authRouter.get('/logout', isAuth, async(req, res) =>{
  if (process.env.SELECTED_DATABASE === 'postgres'){  
    await employeeController.logout(req, res); 
  } else {
    await employeeService.logout(req, res);
  }
})

// authRouter.post('/refresh', async (req, res) => {
//   const refreshToken: string = req.cookies['refreshToken'];
//   const employeeData = jwtService.validateRefreshToken(refreshToken);
//   console.log('employee data = ' + employeeData)

//   if (!employeeData) {
//     console.log('cannot find user');
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const refreshToken = await tokenService.getByToken(refreshToken);
//     const accessToken = jwtService.generateAccessToken()

//     res.cookie('access_token', accessToken, {
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//       httpOnly: true
//     });
//   } catch (error) {
//     return res.status(400).send('Invalid refresh token.');
//   }
//   Редірект на поточний URL
//   res.redirect(req.originalUrl);
// });

export default authRouter;
