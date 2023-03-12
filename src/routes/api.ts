import express, { Request, Response, NextFunction } from 'express';
import { mapDbEventsToEvents, mapDbEventToEvent } from '../lib/Events.js';
import { findBySlug,deleteBySlug, query } from '../lib/db.js';
import{Deild,createDeild, mapDbDeildirToDeildir, updateDeild} from '../lib/Deildir.js';
import { createAfangi, deleteAfangi, mapDbAfangarToAfangar, updateAfangi } from '../lib/Afangar.js';

export const router = express.Router();

export async function index(req: Request, res: Response, next: NextFunction){
  const eventResult = await query('SELECT * FROM events;',[]);
  const events = mapDbEventsToEvents(eventResult);
  if(!events){
    return next();
  }
  res.json(events);
}
export async function deildaIndex(req: Request, res: Response, next: NextFunction){
  const display = await query(`SELECT * FROM deildir;`,[]);
  const displayer = mapDbDeildirToDeildir(display);
  if(!displayer){
    return next()
  }
  res.json(displayer);
}
export async function deildarAfangar(req: Request,res: Response,next: NextFunction){
  const {slug} = req.params;
  const deild = await findBySlug('deildir',slug); 
  if(!deild){
    console.error('deild not found in db')
    return next()
  }
  const potAfangar = await query('select * FROM afangar where deild = $1',[deild]);
  const afangar = mapDbAfangarToAfangar(potAfangar);
  if(!afangar){
    return next()
  }
  res.json(afangar)
}
export async function event(req: Request, res: Response, next: NextFunction){
  const {slug} = req.params;
  const eventResult = await query('SELECT * FROM events WHERE slug = $1;',[slug]);
  const event = mapDbEventToEvent(eventResult);
  if (!event){
    return next();
  }
  res.json(event);
}
//functional
async function makeDeild(req: Request, res: Response, next: NextFunction){
  const {title,slug,description} = req.body;
  const insert: Omit<Deild,'id'>={
    title:title,
    slug:slug,
    description:description,
    created:new Date(),
    updated: new Date()
  } 
  const result = createDeild(insert);
  if(!result){
    return next();
  }
  res.json({title,slug,description});
}
//functional
async function makeAfangi(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await createAfangi(req.body,slug);
  if(!result){
    return next();
  }
  res.json(result);
}
async function deldeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await deleteBySlug('deildir',slug);
  if(!result){
    return next();
  }
  res.json(result);
}
async function patchDeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await updateDeild(slug,req.body)
  if(!result){
    return next();
  }
  res.json(result);
}
async function patchAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const result = await updateAfangi(req.body,deild,slug)
  if(!result){
    return next();
  }
  res.json(result)
}
async function delAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const result = await deleteAfangi(deild,slug)
  if(!result){
    return next()
  }
  res.json(result)
}
router.get('/departments',deildaIndex);
router.get('/departments/:slug',deildarAfangar);
router.get('/',index)
router.patch('/departments/:slug',patchDeild);
router.patch('/departments/:deild/:slug',patchAfangi)
router.post('/departments/:slug',makeAfangi)
router.post('/departments/',makeDeild)
router.delete('/departments/:slug',deldeild);
router.delete('/department/:deild/:slug',delAfangi)

/*
- `GET /departments` skilar lista af deildum:
  - `200 OK` skilað með gögnum.
- `GET /departments/:slug` skilar stakri deild:
  - `200 OK` skilað með gögnum ef deild er til.
  - `404 Not Found` skilað ef deild er ekki til.
- `POST /departments` býr til nýja deild:
  - `200 OK` skilað ásamt upplýsingum um deild.
  - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt (vantar gögn, gögn á röngu formi eða innihald þeirra ólöglegt).
  - `PATCH /departments/:slug` uppfærir deild:
    - `200 OK` skilað með uppfærðri deild ef gekk.
    - `400 Bad Request` skilað ef gögn sem send inn eru ekki rétt.
    - `404 Not Found` skilað ef deild er ekki til.
    - `500 Internal Error` skilað ef villa kom upp.
  - `DELETE /departments/:slug` eyðir deild:
    - `204 No Content` skilað ef gekk.
    - `404 Not Found` skilað ef deild er ekki til.
    - `500 Internal Error` skilað ef villa kom upp.
*/


export async function error() {
  throw new Error('error');
}

