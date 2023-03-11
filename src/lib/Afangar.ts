import { QueryResult } from "pg";
import slugify from "slugify";
import {conditionalUpdate, query,findBySlug, insertCourse} from "./db.js";

export type importAfangi = {
  namsnum: string,
  title: string,
  einingar: number,
  kennslumisseri: string,
  namsstig: string,
  url: string
}
type potUpdateAfangi ={
  id:number,
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
    url: string,
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
    ||!potentialAfangi.url){
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
    url: potentialAfangi.url,
    deild: deild,
    created: new Date(),
    updated: new Date(),
  }
  return afangi


}

export function mapDbAfangitoAfangi(input:QueryResult<Afangi>|null):Afangi|null{    
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
        ||!potentialAfangi.slug
        ||!potentialAfangi.einingar
        ||!potentialAfangi.namsnum
        ||!potentialAfangi.kennslumisseri
        ||!potentialAfangi.namsstig
        ||!potentialAfangi.url
        ||!potentialAfangi.deild
        ||!potentialAfangi.created
        ||!potentialAfangi.updated){
        console.error("missing param for map");
        return null;
    }
    const afangi: Afangi={
        id: potentialAfangi.id,
        title: potentialAfangi.title,
        slug: potentialAfangi.slug,
        einingar: potentialAfangi.einingar,
        namsnum: potentialAfangi.namsnum,
        kennslumisseri:potentialAfangi.kennslumisseri,
        namsstig:potentialAfangi.namsstig,
        url: potentialAfangi.url,
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

export async function updateAfangi(updates:unknown):Promise<QueryResult|null>{
  const update = updates as Partial<potUpdateAfangi>|null;
  if(!update||!update.id){
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
  }if(update.slug){
    keys.push('slug');
    vals.push(update.slug);
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
  return await conditionalUpdate('afangar',update.id,keys,vals);
  


}
//  async function patchAfangi(input:Afangi){
    //vill nota conditionalUpdate hérna. Þarf fylki af lyklum sem á að breyta og fylki af nýju gildunum þeirra
    //return conditionalUpdate('afangar',Afangi.id,lyklar,gildi)
    /*
    const {id} = input;
    const {title,slug,} = input;
    const q =`
      UPDATE afangar
        SET
          name = $1,
          slug = $2,
           = $3,
          updated = CURRENT_TIMESTAMP
        WHERE
          id = $4
        RETURNING id, title, slug, description,created,updated;
          `;
    const vals = [title,slug,description,id];
    const result = await query(q,vals);
    if(!result){
      return null; 
      //next();
    }
    return result;
    //res.json({title,slug,description});
  }
  */
  /*
  async function deleteAfangi(req: Request, res: Response, next: NextFunction){
    const {id} = req.params;
    const q = `
      DELETE FROM afangar
      WHERE 
        id = $1
      RETURNING 1;`;
    const result = await query(q,[id]);
    if(!result){
      return next();
    }
    res.json({});
  
  }*/