import {importAfangiToAfangi} from '../lib/Afangar.js'
import {importDeildToDeild} from '../lib/Deildir.js';
import {readFile } from 'fs/promises';
import path,{join} from 'path';
import { createSchema, dropSchema, end, insertCourse,insertDeild, findBySlug, query as dbquery } from '../lib/db.js';
import { parseJson,parseCSV,readFilesFromDir } from './parse.js';

const data = './data'
 
async function create() {
    const drop = await dropSchema();
  
    if (drop) {
      console.info('schema dropped');
    } else {
      console.info('schema not dropped, exiting');
      process.exit(-1);
    }
  
    const result = await createSchema();
  
    if (result) { 
      console.info('schema created');
    } else {
      console.info('schema not created');
    }
    const inserts = await dirread()
    if(inserts){
        console.info('deildir og afangar inserted')
    }else{
        console.info('afangar og deildir not inserted')
    }
    await end();
  }
  
  create().catch((err) => {
    console.error('Error creating running setup', err);
  });
async function dirread(){
    //athugum hvort við séum með rétta directoryið
    const dataFiles = await readFilesFromDir(data);
    if(!dataFiles){
        console.info('dir not found')
        return null
    }
    for(const ind of dataFiles){
        if(!ind){
            continue
        }
        console.log(path.basename(ind));
        if(path.basename(ind) == "index.json"){
            const indexskra = await parseJson(await (await readFile(ind)).toString());
            for(const i of indexskra){
                const insert = importDeildToDeild(i)
                if(!insert){
                    continue
                }
                await insertDeild(insert)
                const afangar = join(data,i.csv)
                const insAfangar = await parseCSV(afangar)
                const deild = await findBySlug('deildir',insert.slug)
                if(!deild){
                    continue
                }
                for(const x of insAfangar){
                    const insert = importAfangiToAfangi(x,deild)
                    if(!insert){
                        continue
                    }await insertCourse(insert)
                }
            }
            return 1;
        }
    }
}
//create().catch((err:Error) => console.error(err));