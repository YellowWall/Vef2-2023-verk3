import { QueryResult } from "pg";
import {conditionalUpdate, query,findBySlug} from "./db";

export type importAfangi = {
  namsNum: string,
  title: string,
  slug: string,
  einingar: number,
  kennslumisseri: string,
  namsstig: string,
  url: string

}

export type Afangi = {
    id: number,
    deildId: number,
    afangnum: string,
    title: string,
    slug: string,
    einingar: number,
    kennslumisseri: string,
    namsstig: string,
    url: string,
    created:Date,
    updated:Date,};

export function mapDbAfangarToAfangar(    
    input:QueryResult<Afangi>|null):Array<Afangi>{
    if (!input) {
        return [];
    }
    const mappedEvents = input?.rows.map(afangiMapper);

    return mappedEvents.filter((i): i is Afangi=>Boolean(i));
}
export function importAfangiToAfangi(input:unknown,deild:number):Omit<Afangi,'id'>|null{
  const potentialAfangi = input as Partial<importAfangi> | null;
  if(!potentialAfangi
    ||!potentialAfangi.title
    ||!potentialAfangi.slug
    ||!potentialAfangi.einingar
    ||!potentialAfangi.namsNum
    ||!potentialAfangi.kennslumisseri
    ||!potentialAfangi.namsstig
    ||!potentialAfangi.url){
      return null;
    }
  const afangi: Omit<Afangi,'id'>={
    title: potentialAfangi.title,
    slug: potentialAfangi.slug,
    einingar: potentialAfangi.einingar,
    afangnum: potentialAfangi.namsNum,
    kennslumisseri:potentialAfangi.kennslumisseri,
    namsstig:potentialAfangi.namsstig,
    url: potentialAfangi.url,
    deildId: deild,
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
        ||!potentialAfangi.afangnum
        ||!potentialAfangi.kennslumisseri
        ||!potentialAfangi.namsstig
        ||!potentialAfangi.url
        ||!potentialAfangi.deildId
        ||!potentialAfangi.created
        ||!potentialAfangi.updated){
        return null;
    }
    const afangi: Afangi={
        id: potentialAfangi.id,
        title: potentialAfangi.title,
        slug: potentialAfangi.slug,
        einingar: potentialAfangi.einingar,
        afangnum: potentialAfangi.afangnum,
        kennslumisseri:potentialAfangi.kennslumisseri,
        namsstig:potentialAfangi.namsstig,
        url: potentialAfangi.url,
        deildId:potentialAfangi.deildId,
        created: new Date(potentialAfangi.created),
        updated: new Date(potentialAfangi.updated),
    };

return afangi;
}
async function createAfangi(num: string,title:string,einingar:number,kennslumisseri:string,namsstig:string,url:string, deild:number){
    if(!num||!title||!einingar||!kennslumisseri||!namsstig||!url||!deild){
      return null;
    }
    const vals = [deild,title,einingar,kennslumisseri,namsstig,url];
    const q = `
      INSERT INTO afangar
        (deild,title,einingar,kennslumisseri,namsstig,url)
      VALUES
        ($1,$2,$3,$4,$5,$6)
      RETURNING
        title,deild,einingar,kennslumisseri,namsstig,url;
    `;
    const result = await query(q,vals);
    if(!result){
      return null;
    }
    return afangiMapper(result);
  }
  async function patchAfangi(input:Afangi){
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
  */
  }
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