import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = path.join(__dirname, '../data/database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

export default sequelize;