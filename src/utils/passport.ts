import  { ExtractJwt, Strategy as JwtStrategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import fs from 'fs';
import path from 'path'
import { collections } from './database';
import { userController } from '../controllers/user.controller';

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

export function ConfiguratePassport(passport: any){
    const jwtStrategy = new JwtStrategy(options, (jwt_payload: any, done: any) => {
      var user;
      console.log(jwt_payload);
      if (process.env.SELECTED_DATABASE === 'mongo') {
        user = collections.users?.findOne({_id: jwt_payload.sub});
      } else {
        user = userController.getById(jwt_payload.sub);
      }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });              
  passport.use(jwtStrategy);
};