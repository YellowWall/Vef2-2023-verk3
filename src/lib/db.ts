import { readFile } from 'fs/promises';
import {Deild} from './Deildir.js';
import { Afangi } from './Afangar.js';
import dotenv from 'dotenv';
import pg ,{ QueryResult }  from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
dotenv.config({ path: './.env' });


const { DATABASE_URL: connectionString} =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}
const ssl = {rejectUnauthorized: false}
const pool = new pg.Pool({ connectionString,ssl})

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});
type QueryInput = string|number|null;
export async function query(q: string, values: Array<QueryInput>) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    /*
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }*/
    return null;
  } finally {
    client.release();
  }
}
export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'),[]);
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);
  return query(data.toString('utf-8'),[]);
}
export async function insertCourse(course: Omit<Afangi,'id'>): Promise<QueryResult|null>{
  const {title,slug, namsnum, einingar,kennslumisseri,namsstig,url,deild} = course;
  const result = await query(`insert into afangar
  (title,slug,namsnum,einingar,kennslumisseri,namsstig,url,deild)
      values
      ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *;`,[title,slug,namsnum,einingar,kennslumisseri,namsstig,url,deild]);
  return result;
}
export async function conditionalUpdate(
  table:string, id: number, fields: Array<string>,input: Array<string|number>
):Promise<QueryResult|null>{
  if(!table||!id||!fields||!input){
    return null;
  }
  if(fields.length!==input.length){
    console.error('different number of fields and values')
    return null
  }
  const update: Array<string> = []
  let i = 0
  while(i<fields.length){
    update.push(fields[i]+' = '+input[i])
    i++
  }
  if(update.length==0){
    return null
  }
  const updates = update.join(',')
  const q = `update ${table}
    set ${updates},updated= CURRENT_TIMESTAMP where id = $1 returning *; `;
  const result = await query(q,[id]);
  console.error(result)
  if(!result||result.rowCount==0){
    return null
  }
  return result;
}
export async function deleteById(id:number,table:string):Promise<number|null>{
  if(!id||!table){
    return null;
  }
  if(table==='deildir'){
    await query(`DELETE in afangar where deild=$1;`,[id])
  }
  const result = await query(`
    DELETE in ${table} where id = $1 returning 1; `,[id]);
  if(!result){
    return null
  }
  return 1;
}
export async function deleteBySlug(table:string,slug:string):Promise<QueryResult|null>{
  if(!table||!slug){
    return null;
  }
  if(table==='deildir'){
    const key = await findBySlug('deildir',slug);
    if(!key){
      console.error('deild finnst ekki');
      return null;
    }
    await query(`delete from afangar where deild = $1;`,[key]);
  }
  const result = await query(`delete from ${table} where slug = $1 returning 1;`,[slug]);
  if(!result){
    return null;
  }
  return result;

}
export async function insertDeild(deild: Omit<Deild,'id'>):Promise<QueryResult|null>{
  if(!deild.title||!deild.slug||!deild.description){
    console.error("vantar title, slug eða description")
    return null;
  }
  const {title,slug,description} = deild;
  const result = await query(`
  insert into deildir(title,slug,description)
  values($1,$2,$3)
  returning title, slug;`,[title,slug,description]);
  if(!result){
    return null;
  }
  return result;
}
export async function findBySlug(table:string,slug:string):Promise<number|null>{
  if(!table||!slug){
    console.error('missing params');
    return null;
  }
  const result = await query(`Select id from ${table} where slug= $1;`,[slug]);
  if(!result||result.rowCount==0){
    return null;
  }
  return result.rows[0].id;
}

export async function end() {
  await pool.end();
}
