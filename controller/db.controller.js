//import { PrismaClient } from "@prisma/client";
const prisma = require("@prisma/client")
class ControllerDb {
    constructor(){
        this.client  = new prisma.PrismaClient();
        this.client.$connect();
    };

    async createUser(userData) {
        console.log("Я получил данные", userData)
        const res = await this.client.patients.create({data:{phone: userData.phone, name: userData.name, 
            email: userData.email, gender: userData.gender}})  
        
        return res;
    }
    async findUser(userData){
        const res = await this.client.patients.findMany({where: {
            OR:[
                {phone: userData.phone},
                {email: userData.email}
            ]
        }})

        return res
    }

    async findUserById(idUser){
        console.log("Я получил id", Number(idUser))
        const res = await this.client.patients.findFirst({where:{id:Number(idUser)}})

        return res;
    }

    async findDoctorsById(idDoctor){
        const res = await this.client.doctors.findFirst({where: {id:Number(idDoctor)}})

        return res;
    }

    async findTimeById(idTime){
        const res  = await this.client.TimeSample.findFirst({where:{id:Number(idTime)}})

        return res
    }

    async findTime(timeInput){
        const res = await this.client.TimeSample.findFirst({where:{time:timeInput.toISOString()}})
        return res;
    }
    async createDoctor(doctorData){
        const res = await this.client.doctors.create({data:{name:doctorData.name,spec:doctorData.spec,price:doctorData.price}});
        return res;
    }
    
    
    async checkTime(doctorID,timeId,dateUsers){
        console.log("Я получил доктор", doctorID)
        console.log("Я получил время", timeId)
        console.log("Я получил дату", dateUsers.toISOString().split('T')[0])
        console.log(typeof(dateUsers))

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

    async getTimes() {
        const res = await this.client.TimeSample.findMany();
        return res;
    }

    async selectRecords( type, date, timeInput=''){
        console.log("timeInput", timeInput.toISOString())
        const res = []
        if(type == 1){
            try {
                const timeId  = await this.client.TimeSample.findMany({where:{time:timeInput.toISOString()}})
                
                if(timeId.lenght!=0){
                    const records = await this.client.schedule.findMany({where:{AND:{
                        time_from_id:timeId[0].id,date:date}},include:{patient:true,doctors:true}})
                    return records    
                }
                    
                return []
            } catch (error) {
                console.log(error)
            }
        }
        if(type == 2){
            try {
                //const timeId  = await this.client.TimeSample.findMany({where:{time:timeInput.toISOString()}})
                const records = await this.client.schedule.findMany({where:{date:date},include:{patient:true,doctors:true}})
                return records    
            } catch (error) {
                console.log(error)
            }
        }
        
    }

    async createSample(time){
        const res = await this.client.TimeSample.create({data: {time:time.toISOString()}});
        return res
    }
    async closeConnection(){
        await this.client.$disconnect();
        delete this.client
    }



}

module.exports =  ControllerDb;