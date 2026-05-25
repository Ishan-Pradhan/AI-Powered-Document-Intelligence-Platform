import express, { Request, Response } from 'express';
import { connectDB } from './config/db';

const app = express();


const startServer = async () =>{

    app.get("/",(_req:Request, res: Response) =>{
        res.status(200).send("<h1>Hello World</h1>")
    })
    
    await connectDB();
    await 
    
    app.listen(8080, () =>{
        console.log('app is listening at 8080')
    })
}