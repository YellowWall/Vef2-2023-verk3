import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import dotenv from 'dotenv';
import {importDeild, Deild} from '../lib/Deildir';
import { importAfangi,Afangi,importAfangiToAfangi,updateAfangi } from '../lib/Afangar';
import {
  createSchema,
  dropSchema,
  end,
  insertCourse,
  insertDeild,
  conditionalUpdate,
  deleteBySlug,
  findBySlug,
  query

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
        namsnum: 'tes123g',
        title: 'prufa',
        einingar: 4,
        kennslumisseri: 'Vor',
        namsstig: 'grunnám',
        url:'test.com'
    };
    const id = await findBySlug('deildir','test')
    expect(id).not.toBeNull();
    if(id!==null){
        const data = importAfangiToAfangi(testAfangi,id);
        if(data!==null){
        const result = await insertCourse(data);
            if(result!==null){
                expect(result.rows[0].title).toBe('prufa');
            }
        const find = await findBySlug('afangar','prufa')
        expect(find).not.toBeNull()
        }
    }
  });

  it('conditional update virkar', async () =>{
    const id = await findBySlug('afangar','prufa');
    expect(id).not.toBeNull()
    if(id!==null){
      const update = await conditionalUpdate('afangar',id,['einingar'],[1])
      expect(update).not.toBeNull()
      const test = await query(`select einingar from afangar where id =$1`,[id])
      expect(test).not.toBeNull()
      if(test!==null){
        expect(test.rows[0].einingar).toBe(1)
      }
    }
  })
  it('delete afanga úr áfangatöflu', async () => {
    const id = await findBySlug('afangar','prufa');
    expect(id).not.toBeNull();
    if(id!==null){
      const result = await deleteBySlug('afangar','prufa');
      expect(result).not.toBeNull();
    }
  });
  it('eyðum deild og öllum áföngum hennar', async ()=> {
    const testAfangi: importAfangi={
        namsnum: 'tes123g',
        title: 'prufa',
        einingar: 4,
        kennslumisseri: 'Vor',
        namsstig: 'grunnám',
        url:'test.com'
    };
    const id = await findBySlug('deildir','test')
    expect(id).not.toBeNull();
    if(id!==null){
        const data = importAfangiToAfangi(testAfangi,id);
        if(data!==null){
        const result = await insertCourse(data);
            if(result!==null){
                expect(result.rows[0].title).toBe('prufa');
                const del = await deleteBySlug('deildir','test');
                if(del!==null){
                  const find = await findBySlug('deildir','test');
                  const find2 = await findBySlug('afangar','prufa');
                  expect(find && find2).toBeNull();
                }
            }
        }
    }
  });
  /*
  it('update ákveðan hluti í áfanga', async () => {
    const id = findBySlug('afangar','prufa');
    const result = updateAfangi(id,{url:'idiot.com'})
  })*/
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