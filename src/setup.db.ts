import 'dotenv/config';
import { employee } from './models/employee.model.js';
import { holidayRequest } from './models/holidayRequest.model.js';
import { token } from './models/token.js';
import { client } from './utils/db.config.js';
employee;
holidayRequest;
token;
client.sync({force: true});