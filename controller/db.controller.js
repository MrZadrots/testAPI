//import { PrismaClient } from "@prisma/client";
const prisma = require("@prisma/client")
class ControllerDb {
    constructor(){
        this.client  = new prisma.PrismaClient();
        this.client.$connect();
    };
    //Создать пациента
    async createUser(userData) {
        console.log("Я получил данные", userData)
        const res = await this.client.patients.create({data:{phone: userData.phone, name: userData.name, 
            email: userData.email, gender: userData.gender}})  
        
        return res;
    }
    //Найти пациента по его данным
    async findUser(userData){
        const res = await this.client.patients.findMany({where: {
            OR:[
                {phone: userData.phone},
                {email: userData.email}
            ]
        }})

        return res
    }
    //Найти пациента по его id
    async findUserById(idUser){
        console.log("Я получил id", Number(idUser))
        const res = await this.client.patients.findFirst({where:{id:Number(idUser)}})

        return res;
    }
    //Найти доктора по его id
    async findDoctorsById(idDoctor){
        const res = await this.client.doctors.findFirst({where: {id:Number(idDoctor)}})

        return res;
    }
    //Найти время по его id
    async findTimeById(idTime){
        const res  = await this.client.TimeSample.findFirst({where:{id:Number(idTime)}})

        return res
    }
    //Вернуть шаблон слота
    async findTime(timeInput){
        console.log("Controllet time is ", timeInput.toISOString())
        const res = await this.client.TimeSample.findFirst({where:{time:timeInput.toISOString()}})
        return res;
    }
    //Добавить доктора
    async createDoctor(doctorData){
        const res = await this.client.doctors.create({data:{name:doctorData.name,spec:doctorData.spec,price:doctorData.price}});
        return res;
    }
    
    //Проверить свободен ли слот
    async checkTime(doctorID,timeId,dateUsers){


        const res = await this.client.schedule.findMany({where: {
            AND:[
                {doctors_id: Number(doctorID)},
                {time_from_id: Number(timeId)},
                {date: dateUsers.toISOString().split('T')[0]},
                {is_free:false}
            ]
        }})

        return res
    }
    
    //Добавить запись на слот
    async createRecord(pacient_id,doctor_id,slots_id,timeToId_id,fullDateSlots){
        const res = await this.client.schedule.create({data:{
            date: fullDateSlots.toISOString().split('T')[0],
            time_to_id: timeToId_id,
            time_from_id: slots_id,
            patients_id: pacient_id,
            doctors_id: doctor_id,
            type: 1,
            is_free: false
        }})

        return res
    }
    //Вернуть все записи на слот на определенную дату и определенного врача
    async getRecords(date,doctorsId){
        console.log(date)
        const res = await this.client.schedule.findMany({
            where:{AND:{
                doctors_id: Number(doctorsId),
                date: date
            }}
        })
    

        return res
    }
    //Вернуть шаблон слотов
    async getTimes() {
        const res = await this.client.TimeSample.findMany();
        return res;
    }
    //Выбрать нужные записи
    async selectRecords( type, date, timeInput=''){
        const res = []
        if(type == 1){
            try {
                const timeId  = await this.client.TimeSample.findMany({where:{time:timeInput.toISOString()}})
                if(timeId.lenght!=0){
                    
                    const records = await this.client.schedule.findMany({where:{AND:{
                        time_from_id:timeId[0].id,date:date}},include:{patient:true,doctors:true}})
                    console.log("Record",records)
                    return records    
                }
                    
                return []
            } catch (error) {
                console.log(error)
            }
        }
        if(type == 2){
            console.log(date)
            try {
                const records = await this.client.schedule.findMany({where:{date:date},include:{patient:true,doctors:true}})
                return records    
            } catch (error) {
                console.log(error)
            }
        }
        
    }
    //Создать шаблон слотов
    async createSample(time){
        const res = await this.client.TimeSample.create({data: {time:time.toISOString()}});
        return res
    }


    //Добавить задачи для оповещения
    async adddTask (data){
        const res = await this.client.tasks.create({
            data:{
                phone: data.phone, 
                information: data.information,
                isActual: data.isActual,
                countCall: data.countCall,
                status: "new",
                isDone: false
            }
        });

        return res
    }

    //Получить новые задачи для оповещения
    async getTasksStatusNew (){
        const res = await this.client.tasks.findMany({where:{status:"new"}})


        return res
    }

    async getTasks (){
        const res = await this.client.tasks.findMany({where:{AND:{
            status:"process",
            isActual: true,
            countCall:{
                lt:3
            },
            isDone: false
        }}})

        return res
    }
    ///UPDaTE TASK
    async updateTask(inputData){
        console.log("Я получил в бд", inputData)
        console.log("Id",)
        const allRes = []
        inputData.forEach(async el => {
            const res = await this.client.tasks.update({
                where:
                {
                    id:el.id
                },
                data:{
                    status:"process",
                    countCall: Number(el.count)+1
                }
            })
            allRes.push(res)
        })
        return allRes
    }

    async updateCalls (inputData){
        const res = []
        inputData.forEach(async element => {
            const tmpRes = await this.client.calls.upsert({
                where:{
                    id:element.id
                },
                update:{
                    status: element.status,
                    result: element.result,
                    idCallTask: String(element.call_taskId),
                    idBulkId: String(element.bulk_id)
            
                },
                create:{
                    phone:String(element.phone),
                    status: element.status,
                    result: element.result,
                    idCallTask: String(element.call_taskId),
                    idBulkId: String(element.bulk_id)         
                }
            })

            res.push(tmpRes)
        });

        return res
    }

    async updateCallsStatus(inputData){
        const res = []
        console.log(typeof(inputData))
        inputData.forEach(async el=>{
            const resEl = await this.client.calls.update({
                where:{
                    id: el.id
                },
                data:{
                    status:el.status,
                    result:el.information
                }
            })
            res.push(resEl)
        })
    }
    async updateTasksStatus (inputData){
        console.log("Я получил данные для БД", inputData)
        const res = []
        inputData.forEach(async(el, i)=>{
            const resEl = await this.client.tasks.update({
                where:{
                    id:el.id
                },
                data:{
                    isActual: Boolean(el.isActual),
                    status: el.status,
                    isDone: Boolean(el.isDone),
                    information: el.information,
                    //countCall: idCountEl.countCall+1

                }
            })

            res.push(resEl)
        })
        return res
    } 
    async getCalls(){
        const res = await this.client.calls.findMany({where:{
            status:"process"
        }})

        return res
    }
    async closeConnection(){
        await this.client.$disconnect();
        delete this.client
    }



}

module.exports =  ControllerDb;