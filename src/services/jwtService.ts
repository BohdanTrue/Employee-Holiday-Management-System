import jwt, { Secret } from "jsonwebtoken";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// const pathToKey = path.join(process.cwd(), 'id_rsa_priv.pem');
// const SECRET_KEY = fs.readFileSync(pathToKey, 'utf8');
// const REFRESH_KEY = 'adsadasfdavs'; ////12312321321321

function generateAccessToken(user: any) {
  const _id = process.env.SELECTED_DATABASE === 'postgres'
    ? user.id
    : user._id;

  const expiresIn = '5s';
  console.log('id in payload: ' + _id)
  const payload = {
    userId: _id,
    iat: Date.now()
  };
  console.log('payload: ' + JSON.stringify(payload))

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: expiresIn});
}

function validateAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret);
  } catch (error) {
    return null;
  }
}

function generateRefreshToken(user: any) {
  const _id = process.env.SELECTED_DATABASE === 'postgres'
    ? user.id
    : user._id;

  const expiresIn = '15m';

  console.log('id in payload: ' + _id)
  const payload = {
    userId: _id,
    iat: Date.now()
  };
  console.log('payload: ' + JSON.stringify(payload))

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as Secret, { expiresIn: expiresIn});
}

function validateRefreshToken(token: string) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as Secret);
  } catch (error) {
    return null;
  }
}

export const jwtService = { 
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
