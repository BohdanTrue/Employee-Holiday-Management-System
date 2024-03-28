import { DataTypes } from "sequelize";
import { client } from "../utils/db.config.js";

export const user = client.define('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false,
  }
  }, {
    tableName: 'users',
    createdAt: false,
    updatedAt: false,
    underscored: true
});