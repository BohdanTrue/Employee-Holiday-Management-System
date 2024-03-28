import express from 'express';
import { userController } from '../controllers/user.controller.js';
import UserService from '../services/userService.js';
 
const authRouter = express.Router();
const userService = new UserService;

authRouter.get('/register', (req, res) => {
    res.status(200).render('register');
})

authRouter.post('/register', async (req, res) => {
  try {
    if (process.env.SELECTED_DATABASE === 'postgres') {
      await userController.add(req.body.username, req.body.password);
    } else {
      await userService.add(req.body.username, req.body.password);
    }
    res.status(200).redirect('/');
  } catch (error){
    res.status(400).render('register', {error, statusCode: res.statusCode})
  }
})

authRouter.get('/login', (req, res) => {
  res.render('login');
});

authRouter.post('/login', async(req, res) => {
  if (process.env.SELECTED_DATABASE === 'postgres'){  
    await userController.login(req, res); 
  } else {
    await userService.login(req, res);
  }
})

export default authRouter;
