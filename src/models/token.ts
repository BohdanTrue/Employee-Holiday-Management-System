import { DataTypes } from 'sequelize';
import { client } from '../utils/db.config.js';
import { employee } from './employee.model.js';

export const token = client.define('token', {
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

token.belongsTo(employee);
employee.hasOne(token);
