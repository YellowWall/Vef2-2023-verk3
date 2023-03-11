import {readdir,readFile as fsReadFile,stat} from 'fs/promises';
import slugify from 'slugify';
import {join} from 'path';
import {importAfangi }from '../lib/Afangar';
import {importDeild} from '../lib/Deildir';

export function parseJson(input:string):Array<importDeild>{
    let parsed : unknown;
    try{
        parsed = JSON.parse(input);
    }   catch(e) {
        console.error('error parsing json');
        return[];
    }
    if(!Array.isArray(parsed)){
        return [];
    }
    const items: Array<importDeild> = [];
    for(const i of parsed){
        const item = i as Partial<importDeild>;
        if(!item.title||!item.description||!item.csv){
            console.warn('missing required properties in JSON');
        }else{
            items.push({
                title:item.title,
                description: item.description,
                csv: item.csv
            })
        }
        
    }
    return items;
}
export async function parseCSV(input:string):Promise<Array<importAfangi>>{
    let parsed : unknown;
    try{
        const content = await fsReadFile(input,{encoding: 'binary'});
        parsed = await csvFormat(content);
        console.info(parsed)
    }catch(e){
        console.error('error parsing csv');
        return [];
    }
    if(!Array.isArray(parsed)){
        return [];
    }
    const items: Array<importAfangi> = [];
    for(const i of parsed){
        items.push({
            namsnum: i[0],
            title: i[1],
            einingar: i[2],
            kennslumisseri: i[3],
            namsstig: i[4],
            url: i[5]

        })
    }
    return items;
}
async function csvFormat(content:string):Promise<Array<Array<string|number>>|null>{
    const data = content.split(/\r?\n|\r/)
    if(data.length < 2){
        return [];
    }
    const ret: Array<Array<string|number>> = []
    //ef skráin er rétt byrjar hún á þennan hátt
    if(!(data[0]=='Númer;Heiti;Einingar;Kennslumisseri;Námstig;')){
        return [];
    }
    let i = 0;
    for(const line of data){
        //sleppum fyrstu línu
        if(line == data[0]){
            continue;
        }
        const readline = line.split(';');

        if((readline.length < 5) || (readline.length > 6) ){
            continue;
        }if(!(namskeidsnum(readline[0]))){
            continue;
        }if(!(readline[1].length>0)){
            continue;
        }
        const num = formatNum(readline[2]);
        if(num == null){
            continue;
        }readline[2] = num;
        if(!(readline[3]== 'Haust' || readline[3] == 'Vor')){
            continue;
        }if(!(readline[4]== 'Grunnám' || readline[4]=='Framhaldsnám')){
            continue;
        }
        i++;
        ret.push(readline);
    }
    if(i>0){
        return ret;
    }else {
        return null}

}
function formatNum(num:string){
    if(!num){
        return null;
    }/*
    if(typeof num !== 'number'){
        console.log("notNumber");
        return null;
    }*/
    const ret = parseFloat(num).toLocaleString('is');
    return ret.split(',')[0];

}
//Regex til að athuga hvort námskeiðsnúmer sé á réttu formi
function namskeidsnum(data:string):boolean{
    return /^(([A-Z|Á|É|Í|Ó|Ú|Ý|Ð|Þ|Æ|Ö]){3,})+(([0-9]){3,})+(([G|F|M]){1,})$/.test(data);
}
export async function readFilesFromDir(dir:string){
    let files = [];
    try{
        files = await readdir(dir);
    }catch (e){
        return [];
    }
    const mapped = files.map(async (file)=>{
        const path = join(dir,file);
        const info = await stat(path);
        if(info.isDirectory()){
            return null;
        }
        return path;
    });
    const resolved = await Promise.all(mapped);
    return resolved.filter(Boolean);
}
export async function readFile(file:string,{encoding = 'utf8'} = {}){
    try{
        const content = await fsReadFile(file);
        return content.toString(encoding as BufferEncoding);
    } catch(e){
        return null;
    }
}
