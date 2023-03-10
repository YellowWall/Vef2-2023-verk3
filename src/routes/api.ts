import express, { Request, Response, NextFunction } from 'express';
import { findBySlug,deleteBySlug, query } from '../lib/db.js';
import{Deild,createDeild, mapDbDeildirToDeildir, updateDeild} from '../lib/Deildir.js';
import { createAfangi, deleteAfangi, mapDbAfangarToAfangar, mapDbAfangiToAfangi, updateAfangi } from '../lib/Afangar.js';

export const router = express.Router();

export async function deildaIndex(req: Request, res: Response, next: NextFunction){
  const display = await query(`SELECT * FROM deildir;`,[]);
  const displayer = mapDbDeildirToDeildir(display);
  if(!displayer){
    return next()
  }
  res.status(200)
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
  res.status(200)
  res.json(afangar)
}

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
  res.status(200)
  res.json({title,slug,description});
}

async function makeAfangi(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await createAfangi(req.body,slug);
  if(!result){
    return next();
  }
  res.status(200)
  res.json(result);
}
async function deldeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await deleteBySlug('deildir',slug);
  if(!result){
    return next();
  }
  res.status(200)
  res.json(result);
}
async function patchDeild(req:Request,res:Response,next:NextFunction){
  const {slug} = req.params;
  const result = await updateDeild(slug,req.body)
  if(!result){
    return next();
  }
  res.status(200)
  res.json(result);
}
async function patchAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const id = await findBySlug(`deildir`,deild)
  const exists = await query(`select * from afangar where slug=$1 and deild =$2; `,[slug,id])
  if(!exists){
    res.status(400)
    return next()
  }
  const result = await updateAfangi(req.body,deild,slug)
  if(!result){
    return next();
  }
  res.status(200)
  res.json(result)
}
async function delAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const result = await deleteAfangi(deild,slug)
  if(!result){
    return next()
  }
  res.status(200)
  res.json(result)
}
async function showAfangi(req:Request,res:Response,next:NextFunction){
  const {slug,deild} = req.params
  const deildID = await findBySlug('deildir',deild)
  const dbAfangi = await query(`select * from afangar where deild=$1 and slug=$2;`,[deildID,slug])
  const result = mapDbAfangiToAfangi(dbAfangi?.rows[0])
  if(!result){
    res.status(404)
    return next()
  }
  res.status(200)
  res.json(result)
}
router.get('/departments',deildaIndex);
router.get('/departments/:slug',deildarAfangar);
router.get('/departments/:deild/:slug',showAfangi)
router.patch('/departments/:slug',patchDeild);
router.patch('/departments/:deild/:slug',patchAfangi)
router.post('/departments/:slug',makeAfangi)
router.post('/departments/',makeDeild)
router.delete('/departments/:slug',deldeild);
router.delete('/department/:deild/:slug',delAfangi)

/*
- `GET /departments` skilar lista af deildum:
  - `200 OK` skila?? me?? g??gnum.
- `GET /departments/:slug` skilar stakri deild:
  - `200 OK` skila?? me?? g??gnum ef deild er til.
  - `404 Not Found` skila?? ef deild er ekki til.
- `POST /departments` b??r til n??ja deild:
  - `200 OK` skila?? ??samt uppl??singum um deild.
  - `400 Bad Request` skila?? ef g??gn sem send inn eru ekki r??tt (vantar g??gn, g??gn ?? r??ngu formi e??a innihald ??eirra ??l??glegt).
  - `PATCH /departments/:slug` uppf??rir deild:
    - `200 OK` skila?? me?? uppf??r??ri deild ef gekk.
    - `400 Bad Request` skila?? ef g??gn sem send inn eru ekki r??tt.
    - `404 Not Found` skila?? ef deild er ekki til.
    - `500 Internal Error` skila?? ef villa kom upp.
  - `DELETE /departments/:slug` ey??ir deild:
    - `204 No Content` skila?? ef gekk.
    - `404 Not Found` skila?? ef deild er ekki til.
    - `500 Internal Error` skila?? ef villa kom upp.
*/


export async function error() {
  throw new Error('error');
}

