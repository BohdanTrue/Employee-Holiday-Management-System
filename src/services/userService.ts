import { ObjectId } from 'mongodb';
import { collections } from '../utils/database.js';
import User from '../models/user.js';
import { genPassword, issueJWT, validPassword } from '../utils/passwordUtils.js';

export default class UserService {

    async getAll(): Promise<User[]> {
     return await collections.users?.find({}).toArray() as User[];
   }
 
   async add(username: string, password: string): Promise<void> {
    const saltHash = genPassword(password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
     const newUser = {
       username: username,
       hash: hash,
       salt: salt
     }
     await collections.users?.insertOne(newUser);
   }
 
   async getById(id: ObjectId): Promise<User>{
     return await collections.users?.findOne({ _id: id}) as User;
   }

   async login(req: any, res: any){        
    const user = await collections.users?.findOne({ username: req.body.username })
    if (user) {
      const isValid = validPassword(req.body.password, user.hash, user.salt);
      if (isValid) {
        res.status(200).redirect('/');
      } else {
        res.status(401).render('login', {error: 'wrong username or password', statusCode: res.statusCode});
      }
    } else {
        req.status(400);
    }
   }
 }