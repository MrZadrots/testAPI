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
    
    
    async checkTime(doctorID,timeId){
        console.log("Я получил доктор", doctorID)
        console.log("Я получил пациента", timeId)
        const res = await this.client.Schedule.findMany({where: {
            AND:[
                {doctors_id: Number(doctorID)},
                {time_from_id: Number(timeId)},
                {is_free:false}
            ]
        }})

        return res
    }
    
    
    
    
    async closeConnection(){
        await this.client.$disconnect();
    }



}

module.exports =  ControllerDb;