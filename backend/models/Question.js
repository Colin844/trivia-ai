// models/Question.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

export class Question extends Model {}
Question.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trivia_id: { type: DataTypes.INTEGER, allowNull: false },
    statement: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, defaultValue: 100 },
    time_limit_s: { type: DataTypes.INTEGER, defaultValue: 30 },
    position: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "questions",
    timestamps: false,
    underscored: true,
  }
);
