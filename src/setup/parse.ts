import {readdir,readFile as fsReadFile,stat} from 'fs/promises';
import importAfangi from './lib/Afangar';
import importDeild from './lib/Deildir';

export function parseJson(input:string):Array<deildImport>{
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
    const items: Array<deildImport> = [];
    for(const i of parsed){
        const item = i as Partial<deildImport>;
        if(!item.title||!item.description||!item.csv){
            console.warn('missing required properties in JSON');
        }else{
            items.push({
                title:item.title,
                slug:slugify(item.title).toLowerCase(),
                description: item.description,
                csv: item.csv
            })
        }
        
    }
    return items;
}
export function parseCSV(input:string):Array<importAfangi>{
    let parsed : unknown;
    try{
        let content = readFile(string);
        parsed = csvFormat(content);
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
            namsNum: i[0],
            title: i[1],
            slug: slugify(i[1]).toLowerCase(),
            einingar: i[2],
            kennslumisseri: i[3],
            namsstig: i[4]

        })
    }
    return items;
}
async function csvFormat(content:string):Array<string>{
    const data = content.split(/\r?\n|\r/);
    if(data.length < 2){
        return [];
    };
    var ret = new Array();
    //ef skráin er rétt byrjar hún á þennan hátt
    if(!(data[0]=='Númer;Heiti;Einingar;Kennslumisseri;Námstig;')){
        return [];
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
        return [];};

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