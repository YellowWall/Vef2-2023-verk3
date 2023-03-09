import express, { NextFunction, request, Request, Response } from 'express';
import dotenv from 'dotenv';
import { router } from './routes/api.js';

const app = express();
dotenv.config();
app.use(express.json());

app.use(router);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

function notFoundHandler(req:Request, res:Response, next:NextFunction) {
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err: Error , req: Request, res:Response, next: NextFunction) { 
  console.error(err);

  if (err instanceof SyntaxError && res.statusCode === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}
function hallo(req:Request, res:Response, next:NextFunction){
  return res.json({hallo:"hallo"});
}
app.get('/hi',hallo)
app.use(notFoundHandler);
app.use(errorHandler);
