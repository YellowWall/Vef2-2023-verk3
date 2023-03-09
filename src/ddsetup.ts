import {readdir,readFile as fsReadFile,stat} from 'fs/promises';
import path,{ join } from 'path';
import {createDeild } from './lib/Deildir.js'
import {createAfangi} from './lib/Afangar.js'
import {query} from './lib/db.js'
const data_dir = './data';

async function direxists(dir){
    try{
        const info = await statusbar(dir);
        console.log(info.isDirectory());
        return info.isDirectory();
    } catch(e){
        return false;
    }
}

async function main(){
    const dataFiles  = await readFilesFromDir(data_dir);
    var indexskra = null;
    for(const ind of dataFiles){
    if(path.basename(ind) == "index.json"){
        indexskra = ind;
        const data = await readFile(indexskra);
        const entries = JSON.parse(data);
        for(const entry of entries){
            createDeild(entry.title,entry.csv.spilt('.')[0],entry.description);
        }
        }
    };
    if(indexskra==null){
        throw console.error("Fann ekki indexskrá");
    };
    var ind = '';
    for (const file of dataFiles){
        if(path.basename(file)=='index.json'){
            continue;
        }
        const content = await readFile(file,{encoding: 'binary'});
        const arr = await csvformat(content,"");
        const deild = await query(`Select id from deildir where slug = $1`,[path.basename(file).split('.')[0]]);
        if(arr !== null){
            for (const entry in arr){
                createAfangi(entry[0],entry[1],entry[2],entry[3],entry[4],entry[5],deild.id);
            }
        };
   
    };
};
async function jsonread(file,a){
    const data = await readFile(file);
    const entries = JSON.parse(data);
    for(const entry of entries){
        if(entry.csv == a){
            return [entry.title,entry.description];
        }
    }
}
export async function csvformat(content,sort){
    const data = content.split(/\r?\n|\r/);
    if(data.length < 2){
        return null;
    };
    var ret = new Array();
    //ef skráin er rétt byrjar hún á þennan hátt
    if(!(data[0]=='Númer;Heiti;Einingar;Kennslumisseri;Námstig;')){
        return null;
    };
    var i = 0;
    for(const line of data){
        //sleppum fyrstu línu
        if(line == data[0]){
            continue;
        };
        var readline = line.split(';');

        if((readline.length < 5) || (readline.length > 6) ){
            continue;
        };if(!(namskeidsnum(readline[0]))){
            continue;
        };if(!(readline[1].length>0)){
            continue;
        };
        var num = formatNum(readline[2]);
        if(num == null){
            continue;
        };readline[2] = num;
        if(!(readline[3]== 'Haust' || readline[3] == 'Vor')){
            continue;
        };if(!(readline[4]== 'Grunnám' || readline[4]=='Framhaldsnám')){
            continue;
        };
        i++;
        ret.push(readline);
    };
    if(i>0){
        return ret;
    }else {
        return null;};

}
function formatNum(num){
    if(num == undefined){
        return null;
    }
    //if(typeof num !== 'number'){
        //console.log("notNumber");
        //return null;
    //}
    var ret = parseFloat(num).toLocaleString('is');
    return ret.split(',')[0];

}
//Regex til að athuga hvort námskeiðsnúmer sé á réttu formi
function namskeidsnum(data){
    return /^(([A-Z|Á|É|Í|Ó|Ú|Ý|Ð|Þ|Æ|Ö]){3,})+(([0-9]){3,})+(([G|F|M]){1,})$/.test(data);
}
//function insertionSort(data, sortval){

//}
export async function readFilesFromDir(dir){
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
export async function readFile(file,{encoding = 'utf8'} = {}){
    try{
        const content = await fsReadFile(file);
        return content.toString(encoding);
    } catch(e){
        return null;
    }
};
