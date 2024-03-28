import 'dotenv/config';
import { employee } from './models/employee.model.js';
import { holidayRequest } from './models/holidayRequest.model.js';
import { client } from './utils/db.config.js';
client.sync({force: true});