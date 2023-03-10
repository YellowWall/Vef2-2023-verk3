import { QueryResult } from "pg";
import { insertDeild, query } from '../lib/db';

/*
{
    "title": "Hagfræðideild",
    "description": "Menntun í Hagfræðideild er greiðasta leiðin til þátttöku, rannsókna og skilnings á hagkerfi okkar. Kennslan stendur á sterkum grunni og er markmið námsins að veita nemendum góðan undirbúning í hagfræði, stærðfræði og tölfræði og möguleika á sérhæfingu í öðrum greinum.",
    "csv": "hagfraedi.csv"
  },
*/
export type importDeild = {
  title:string,
  slug:string,
  description: string,
  csv: string
}
export type Deild = {
    id: number,
    title: string,
    slug: string,
    description: string,
    created:Date,
    updated:Date};

export function mapDbDeildirToDeildir(    
    input:QueryResult<Deild>|null):Array<Deild>{
    if (!input) {
        return [];
    }
    const mappedDeildir = input?.rows.map(deildMapper);

    return mappedDeildir.filter((i): i is Deild=>Boolean(i));
}

function mapDbDeildToDeild(input:QueryResult<Deild>|null):Deild|null{    
    if (!input){
    return null;
}

return deildMapper(input);
}
export function deildMapper(input: unknown): Deild | null {
    const potentialDeild = input as Partial<Deild> | null
    if(!potentialDeild
        ||!potentialDeild.id
        ||!potentialDeild.title
        ||!potentialDeild.slug
        ||!potentialDeild.created
        ||!potentialDeild.updated){
        return null;
    }
    

    const deild: Deild={
        id: potentialDeild.id,
        title: potentialDeild.title,
        slug: potentialDeild.slug,
        description:potentialDeild.description ? potentialDeild.description : "",
        created: new Date(potentialDeild.created),
        updated: new Date(potentialDeild.updated),
    };

return deild;
}
export async function createDeild(input:Omit<Deild,'id'>):Promise<Deild|null>{
    const result = await insertDeild(input);
    if(!result){
      return null;
    }
    return deildMapper(result);
  }

async function updateDeild(input:number,data:Deild):Promise<Deild|null>{
    const id = input;
    const {title,slug,description} = data as Deild;
    const q =`
      UPDATE deildir
        SET
          name = $1,
          slug = $2,
          description = $3,
          updated = CURRENT_TIMESTAMP
        WHERE
          id = $4
        RETURNING id, title, slug, description,created,updated;
          `;
    const vals = [title,slug,description,id];
    const result = await query(q,vals);
    if(!result){
      return null;
    }
    return deildMapper(result);
  
  }
  
async function deleteDeild(input:number):Promise<number|null>{
    const id = input as Partial<number> | null;
    if(!id){
      return null;
    }
    const q = `
      DELETE FROM deildir
      WHERE 
        id = $1
      RETURNING 1;`;
    const result = await query(q,[id]);
    if(!result){
      return null;
    }
    return 1;
  
  }