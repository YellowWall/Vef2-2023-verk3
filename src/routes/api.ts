import express, { Request, Response, NextFunction } from 'express';
import { mapDbEventsToEvents, mapDbEventToEvent } from '../lib/Events.js';
import { query } from '../lib/db.js';

export const router = express.Router();

export async function index(req: Request, res: Response, next: NextFunction){
  const eventResult = await query('SELECT * FROM events;',[]);
  const events = mapDbEventsToEvents(eventResult);
  if(!events){
    return next();
  }
  res.json(events);
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
async function createEvent(req: Request, res: Response, next: NextFunction){
  console.log(req.body);
  const {name,slug,description} = req.body;
  const vals = [name,slug,description];
  const q = `
    INSERT INTO events
      (name,slug,description,created,updated)
    VALUES
      ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    RETURNING
      id,name,slug;
  `;
  const result = await query(q,vals);
  if(!result){
    return next();
  }
  res.json({name,slug,description});
}
async function patchEvent(req: Request, res: Response, next: NextFunction){
  const {id} = req.params;
  const {name,slug,description} = req.body;
  const q =`
    UPDATE events
      SET
        name = $1,
        slug = $2,
        description = $3,
        updated = CURRENT_TIMESTAMP
      WHERE
        id = $4
      RETURNING id, name, slug, description;
        `;
  const vals = [name,slug,description,id];
  const result = await query(q,vals);
  if(!result){
    return next();
  }
  res.json({name,slug,description});

}

async function deleteEvent(req: Request, res: Response, next: NextFunction){
  const {id} = req.params;
  const q = `
    DELETE FROM events
    WHERE 
      id = $1
    RETURNING 1;`;
  const result = await query(q,[id]);
  if(!result){
    return next();
  }
  res.json({});

}
router.get('/',index);
router.get('/:slug',event);
router.patch('/:slug',patchEvent);
router.post('/',createEvent)
router.delete('/:slug',deleteEvent);



export async function error() {
  throw new Error('error');
}

