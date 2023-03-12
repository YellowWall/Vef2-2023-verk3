import slugify from 'slugify';
import { QueryResult } from "pg";
import { conditionalUpdate, findBySlug, insertDeild } from '../lib/db.js';
/*
{
    "title": "Hagfræðideild",
    "description": "Menntun í Hagfræðideild er greiðasta leiðin til þátttöku, rannsókna og skilnings á hagkerfi okkar. Kennslan stendur á sterkum grunni og er markmið námsins að veita nemendum góðan undirbúning í hagfræði, stærðfræði og tölfræði og möguleika á sérhæfingu í öðrum greinum.",
    "csv": "hagfraedi.csv"
  },
*/
export type importDeild = {
  title:string,
  description: string,
  csv: string
}
type updateDeild = {
  title?:string,
  description?:string,
  slug?: string
}
export type Deild = {
    id: number,
    title: string,
    slug: string,
    description: string,
    created:Date,
    updated:Date};

export function importDeildToDeild(input: unknown):Omit<Deild,'id'>|null{
  const potentialDeild = input as Partial<importDeild> | null;
  if(!potentialDeild
    ||!potentialDeild.title
    ||!potentialDeild.description
    ){
      console.error('importAfanga param vantar')
      return null;
    }
  const deild: Omit<Deild,'id'>={
    title: potentialDeild.title,
    slug: slugify(potentialDeild.title).toLowerCase(),
    description:potentialDeild.description,
    created: new Date(),
    updated: new Date()
  }
  return deild
}
export function mapDbDeildirToDeildir(    
    input:QueryResult<Deild>|null):Array<Deild>{
    if (!input) {
        return [];
    }
    const mappedDeildir = input?.rows.map(deildMapper);

    return mappedDeildir.filter((i): i is Deild=>Boolean(i));
}
/*
function mapDbDeildToDeild(input:QueryResult<Deild>|null):Deild|null{    
    if (!input){
    return null;
}

return deildMapper(input);
}*/
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

export async function updateDeild(input:string,data:unknown):Promise<Deild|null>{
    const id = await findBySlug('deild',input)
    if(!id){
      return null
    }
    const potentialDeild = data as Partial<updateDeild>|null;
    if(!potentialDeild){
      return null
    }
    const updates: Array<string> = []
    const values: Array<string> = []
    if(potentialDeild.title){
      updates.push('title')
      values.push(potentialDeild.title)
    }
    if(potentialDeild.description){
      updates.push('description')
      values.push(potentialDeild.description)
    }
    if(potentialDeild.slug){
      updates.push('slug')
      values.push(slugify(potentialDeild.slug).toLowerCase())
    }
    const result = await conditionalUpdate('deildir',id,updates,values)
    if(!result){
      return null;
    }
    return deildMapper(result.rows[0]);
  
  }
