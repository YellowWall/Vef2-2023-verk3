import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import dotenv from 'dotenv';
import {importDeild, Deild} from '../lib/Deildir';
import { importAfangi,Afangi,importAfangiToAfangi } from '../lib/Afangar';
import {
  createSchema,
  dropSchema,
  end,
  insertCourse,
  insertDeild,
  conditionalUpdate,
  deleteBySlug,
  findBySlug

} from '../lib/db';

dotenv.config({ path: './.env.test' });

describe('db', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('allows registering of valid deild', async () => {
    const testdeild: Deild ={
        id:0,
        title:"test",
        slug:"test",
        description:"test",
        created: new Date(),
        updated: new Date()
      }
    const result = await insertDeild(testdeild);
    if(!result){
        expect(result).not.toBeNull();
    }else{
    expect(result.rows[0].title).toBe("test");}
  });
  it('does not allow already existing deild to be registered', async () => {
    const testdeild: Deild ={
        id:0,
        title:"test",
        slug:"test",
        description:"test",
        created: new Date(),
        updated: new Date()
      }
    const result = await insertDeild(testdeild);
    expect(result).toBeNull();
});
  it('allows to find id by slug', async () => {
    const result = await findBySlug('deildir','test');
    expect(result).not.toBeNull();
  });
  it('Add afangi to deild', async ()=> {
    const testAfangi: importAfangi={
        namsNum: 'tes123g',
        title: 'prufa',
        slug: 'prufa',
        einingar: 4,
        kennslumisseri: 'Vor',
        namsstig: 'grunnám',
        url:''
    };
    const id = await findBySlug('deildir','test')
    expect(id).not.toBeNull();
    if(id!==null){
        const data = importAfangiToAfangi(testAfangi,id.rows[0].id);
        if(data!==null){
        const result = await insertCourse(data);
            if(result!==null){
                expect(result.title).toBe('prufa');
            }
        }
    }
  });
});
/*
  const user = {username:'D',name:'Gunna' }
  it('does not allow registering to non existant event', async () => {
    const registration = await register({ user, event: 0 });

    expect(registration).toBeNull();
  });

  it('does not allow registering to non existant event', async () => {
    const registration = await register({event: 0 });

    expect(registration).toBeNull();
  });
  it('does not allow events to be deleted', async () =>{
    await removeEvent({name: 'two'});
    const test = await listEventByName({name: 'two'});
    expect(test).toBeNull();
  })
});*/