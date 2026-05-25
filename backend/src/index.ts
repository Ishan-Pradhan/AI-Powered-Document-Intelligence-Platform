import express, { Request, Response } from 'express';
import {  sequelize } from './config/db';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//routes
import authRoutes from './routes/auth.routes';

app.use("/api/v1/auth", authRoutes)


    app.get("/",(_req:Request, res: Response) =>{
        res.status(200).send("<h1>Hello World</h1>")
    })

    export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};
     connectDB();
    
    app.listen(process.env.PORT, () =>{
        console.log(`app is listening at ${process.env.PORT}`)
    })
