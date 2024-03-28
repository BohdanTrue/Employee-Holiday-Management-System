import { user as User } from "../models/user.model.js";
import { Request, Response } from 'express';
import { genPassword, validPassword } from "../utils/passwordUtils.js";

const add = async (username: string, password:string) => {
    const saltHash = genPassword(password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    try {        
        await User.create({username, hash, salt});
    } catch (err) {        
        throw err;   
    }
}

const getAll = async (req: Request, res: Response) => {
  return await User.findAll();
}

const getById = async(id: number) => {
  try {
    return await User.findByPk(id);
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    throw error;
  }
}

const login = async(req: Request, res: Response) => {
  const user: any  = await User.findOne({ where: {username: req.body.username}});  
    if (!user) {
      return res.status(401).render('login', {msg: 'could not find the user', statusCode: res.statusCode});
    }
    const isValid = validPassword(req.body.password, user.hash, user.salt);
    
    if (isValid) {
      res.status(200).redirect('/');
    } else {
      res.status(401).render('login', {msg: 'wrong username or password'});
    }
};

export const userController = {
  login, add, getAll, getById
}