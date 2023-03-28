import express, { Request, Response, NextFunction } from 'express';
import { findBySlug,deleteBySlug, query } from '../lib/db.js';
import{Deild,createDeild, mapDbDeildirToDeildir, updateDeild} from '../lib/Deildir.js';
import { createAfangi, deleteAfangi, mapDbAfangarToAfangar, mapDbAfangiToAfangi, updateAfangi } from '../lib/Afangar.js';
import slugify from 'slugify';
export const router = express.Router();

export async function deildaIndex(req: Request, res: Response, next: NextFunction){
  const display = await query(`SELECT * FROM deildir;`,[]);
  const displayer = mapDbDeildirToDeildir(display);
  if(!displayer){
    return next()
  }
  return res.status(200).json(displayer);
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
  return res.status(200).json(afangar)
}

async function makeDeild(req: Request, res: Response, next: NextFunction){
  const {title,description} = await req.body;
  const insert: Omit<Deild,'id'>={
    title:title,
    slug:slugify(title).toLowerCase(),
    description:description? description:null,
    created:new Date(),
    updated: new Date()
  } 
  const result = createDeild(insert);
  if(!result){
    return next();
  }
  return res.status(200).json(result);
}

async function makeAfangi(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await createAfangi(await req.body,slug);
  if(!result){
    return next();
  }
  return res.status(200).json(result);
}
async function deldeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await deleteBySlug('deildir',slug);
  if(!result){
    return next();
  }
  return res.status(200).json(result);
}
async function patchDeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await updateDeild(slug,req.body)
  if(!result){
    return next();
  }
  return res.status(200).json(result);
}
async function patchAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const id = await findBySlug(`deildir`,deild)
  const exists = await query(`select * from afangar where slug=$1 and deild =$2; `,[slug,id])
  if(!exists){
    return res.status(400);
  }
  const result = await updateAfangi(await req.body,deild,slug)
  if(!result){
    return res.status(400);
  }
  return res.status(200).json(result);
}
async function delAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const result = await deleteAfangi(deild,slug)
  if(!result){
    return res.status(400)
  }
  return res.status(200).json(result)
}
async function showAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const deildID = await findBySlug('deildir',deild)
  const dbAfangi = await query(`select * from afangar where deild=$1 and slug=$2;`,[deildID,slug])
  const result = mapDbAfangiToAfangi(dbAfangi?.rows[0])
  if(!result){
    return res.status(400);
  }
  return res.status(200).json(result)
}
router.get('/departments',deildaIndex);
router.get('/departments/:slug',deildarAfangar);
router.get('/departments/:deild/:slug',showAfangi)
router.patch('/departments/:slug',patchDeild);
router.patch('/departments/:deild/:slug',patchAfangi)
router.post('/departments/:slug',makeAfangi)
router.post('/departments',makeDeild)
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

