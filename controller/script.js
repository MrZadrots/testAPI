//import { PrismaClient } from "@prisma/client";
const prisma = require("@prisma/client")

//Создаем новый клиент
const connect = () =>{
    const client = new prisma.PrismaClient();

    return client;
}
//Предзаполняем таблицу
const createDataInTimeSample = async () =>{
    //Создаем новый клиент и делаем подключение

    const client = await connect();
    const timeMassive = ['9:00','9:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
                        '16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00']

    timeMassive.forEach(async elem =>{
       
        const time = new Date();
        const hours = elem.split(':')[0];
        const minutes = elem.split(':')[1] 
        time.setSeconds(0,0)
        time.setHours(Number(hours)+7)
        time.setMinutes(Number(minutes))
        console.log(`${hours}:${minutes}`)
        console.log(time.toISOString())
        console.log(time.getHours(), time.getMinutes())
        await client.$connect;
        const res = await client.TimeSample.create({data: {time:time.toISOString()}})
        //console.log(elem)
        await client.$disconnect()
    })



}

createDataInTimeSample()