import { QueryResult } from "pg";
import slugify from "slugify";
import {conditionalUpdate,deleteById,findBySlug, insertCourse, query} from "./db.js";

export type importAfangi = {
  namsnum: string,
  title: string,
  einingar: number,
  kennslumisseri: string,
  namsstig: string,
  url: string
}
type potUpdateAfangi ={
  namsnum?: string,
  title?: string,
  slug?: string,
  einingar?: number,
  kennslumisseri?: string,
  namsstig?: string,
  url?: string
}

export type Afangi = {
    id: number,
    deild: number,
    namsnum: string,
    title: string,
    slug: string,
    einingar: number,
    kennslumisseri: string,
    namsstig: string,
    url?: string,
    created:Date,
    updated:Date,};

export function mapDbAfangarToAfangar(    
    input:QueryResult|null):Array<Afangi>{
    if (!input) {
        console.error('bad input')
        return [];
    }
    const mappedEvents = input?.rows.map(afangiMapper);
    return mappedEvents.filter((i): i is Afangi=>Boolean(i));
}
export function importAfangiToAfangi(input:unknown,deild:number):Omit<Afangi,'id'>|null{
  const potentialAfangi = input as Partial<importAfangi> | null;
  if(!potentialAfangi
    ||!potentialAfangi.title
    ||!potentialAfangi.einingar
    ||!potentialAfangi.namsnum
    ||!potentialAfangi.kennslumisseri
    ||!potentialAfangi.namsstig
    ){
      console.error('importAfanga param vantar')
      return null;
    }
  const afangi: Omit<Afangi,'id'>={
    title: potentialAfangi.title,
    slug: slugify(potentialAfangi.title).toLowerCase(),
    einingar: potentialAfangi.einingar,
    namsnum: potentialAfangi.namsnum,
    kennslumisseri:potentialAfangi.kennslumisseri,
    namsstig:potentialAfangi.namsstig,
    url: potentialAfangi.url? potentialAfangi.url:undefined,
    deild: deild,
    created: new Date(),
    updated: new Date(),
  }
  return afangi


}

export function mapDbAfangiToAfangi(input:QueryResult<Afangi>|null):Afangi|null{    
    if (!input){
    return null;
}

return afangiMapper(input);
}
export function afangiMapper(input: unknown): Afangi | null {
    const potentialAfangi = input as Partial<Afangi> | null
    if(!potentialAfangi
        ||!potentialAfangi.id
        ||!potentialAfangi.title
        ||!potentialAfangi.einingar
        ||!potentialAfangi.namsnum
        ||!potentialAfangi.kennslumisseri
        ||!potentialAfangi.namsstig
        ||!potentialAfangi.deild
        ||!potentialAfangi.created
        ||!potentialAfangi.updated){
        console.error("missing param for map");
        return null;
    }
    const afangi: Afangi={
        id: potentialAfangi.id,
        title: potentialAfangi.title,
        slug: slugify(potentialAfangi.title).toLowerCase(),
        einingar: potentialAfangi.einingar,
        namsnum: potentialAfangi.namsnum,
        kennslumisseri:potentialAfangi.kennslumisseri,
        namsstig:potentialAfangi.namsstig,
        url: potentialAfangi.url? potentialAfangi.url:undefined,
        deild:potentialAfangi.deild,
        created: new Date(potentialAfangi.created),
        updated: new Date(potentialAfangi.updated),
    };

return afangi;
}
export async function createAfangi(input:unknown,slug:string):Promise<Afangi|null>{
  const deild = await findBySlug('deildir',slug);
  if(!deild){
    console.error("deild finnst ekki")
    return null;
  }
  const event = input as Partial<importAfangi>|null;
  if(!event){
    return null
  }
  const potential = importAfangiToAfangi(event,deild);
  if(!potential){
    console.error("villa við afangaconversion")
    return null;
  }
  const result = await insertCourse(potential);
  if(!result){
    console.error("villa við afangainsertion")
  }
  return afangiMapper(result?.rows[0]);
}

export async function updateAfangi(updates:unknown, deild: string,slug:string):Promise<Afangi|null>{
  const deildId = await findBySlug('deildir',deild)
  if(!deildId){
    return null
  }
  const id = await findBySlug('afangar',slug)
  if(!id){
    return null
  }
  const test = await query('select id from afangar where id=$1 and deild=$2;',[id,deildId])
  if(!test||test.rowCount==0){
    return null
  }
  const update = updates as Partial<potUpdateAfangi>|null;
  if(!update){
    return null;
  }
  const keys: Array<string>=[];
  const vals: Array<string|number> = [];
  if(update.namsnum){
    keys.push('namsNum');
    vals.push(update.namsnum);
  }if(update.title){
    keys.push('title');
    vals.push(update.title);
    keys.push('slug');
    vals.push(slugify(update.title).toLowerCase());
  }if(update.namsstig){
    keys.push('namsstig');
    vals.push(update.namsstig)
  }if(update.kennslumisseri){
    keys.push('kennslumisseri');
    vals.push(update.kennslumisseri)
  }if(update.url){
    keys.push('url');
    vals.push(update.url)
  }if(update.einingar){
    keys.push('einingar');
    vals.push(update.einingar);
  }if(keys.length===0){
    return null;
  }
  const result = await conditionalUpdate('afangar',id,keys,vals);
  if(!result){
    return null
  }
  return afangiMapper(result.rows[0]);
}
export async function deleteAfangi(deild:string,afangi:string){
  const deildId = await findBySlug('deildir',deild)
  const afangiId = await findBySlug('afangar',afangi)
  if(!deildId||!afangiId){
    return null
  }
  const test = await query('select id from afangar where id=$1 and deild=$2;',[afangiId,deildId])
  if(!test||test.rowCount==0){
    return null
  }
  const result = await deleteById(afangiId,'afangar')
  if(!result){
    return null
  }
  return result
}