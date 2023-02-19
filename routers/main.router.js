const express = require('express')
const bcrypt = require('bcrypt')
const {check, validationResult} = require('express-validator')
const router = express.Router();
//import {ControllerDb} from "../controller/db.controller"
const controller = require('../controller/db.controller')

/**
 * Запрос для добавления пациента
 * 
 */
router.post(
    "/register",
    [
        check("phone","Неверный номер телефона").isLength({min:7}).isMobilePhone(),
        check("name","Невреное имя. Пожалуйста, введите действительное имя").isLength(3).isString(),
        check("email","Неверный адресс электронной почты").notEmpty().isEmail(),
        check("gender","Невреный пол").notEmpty().isString().isIn(['male','female']),
        check("password","Некоректный пароль. Минимальная длина 4 символа").isString().isLength({min:4})
    ], 
    async (req,res)=>{
        try {
            const dataUser = {...req.body};
            const myController = new controller();

            const errors = await validationResult(req)
            if (!errors.isEmpty())
                return res.status(401).json({
                    errors: errors.array(),
                    message:errors.array()[0].msg
                })
            //Проверить наличие пользователя в БД
            const user = await myController.findUser(dataUser);
            console.log("Я нашел пользователя", user)
            console.log(!user)
            if(user.length !=0){
                await myController.closeConnection();
                return res.status(201).json({message:"Пользователь с таким номером телефона или почтой уже существует!"})
            }

            console.log("Creating")
            //Добавить нового пользователя
            console.log("Я делаю хеш")
            //const passwordHasher = await bcrypt.hash(dataUser.passwordHasher,12);
            console.log("Я сделал хеш")
            //dataUser.password = passwordHasher;

            console.log("Я отправляю данные,", dataUser)
            const addedUser = await myController.createUser(dataUser);
            
            console.log(addedUser);
            await myController.closeConnection();
            return res.status(200).json({message:"Вы успешно добавлены!"});
        } catch (error) {
            return res.status(500).json({message:error.message});
        }

    }
);
/**
 * Запрос для добавления записи
 * 
 */
router.post(
    "/add/",
    [], 
    async (req,res)=>{
        try {
            const {pacient_id,doctor_id,scedule_id,date_slots} = req.body;
            const myController = new controller();
            //Проверить есть ли такой пациент
            const pacient = await myController.findUserById(pacient_id)
            if(pacient.length == 0){
                return res.status(401).json({message: "Такого пациента не существует"})
            }
            //Проверить есть ли такой врач
            const doctor = await myController.findDoctorsById(doctor_id)
            if(doctor.length == 0){
                return res.status(401).json({message: "Такого доктора не существует"})
            }
            //Найти время 
            const slots = await myController.findTimeById(scedule_id)
            const fullDateSlots = new Date()
            const date_slotsMas = date_slots.split('.');
            fullDateSlots.setFullYear(Number(date_slotsMas[2]))
            fullDateSlots.setMonth(Number(date_slotsMas[1]),0,0)
            fullDateSlots.setDate(Number(date_slotsMas[0],0,0))
            fullDateSlots.setMinutes(0,0,0)
            fullDateSlots.setSeconds(0,0,0)

            
            //Проверяем свободно ли время
            const check = await myController.checkTime(doctor.id,slots.id,fullDateSlots)
            if(check.length!=0){
                return res.status(401).json({message:"Время у врача занято! Выберите другое."})
            }
            
            //Считаем время до конца записи(timeTo)
            const fullTimeMas = slots.time.toLocaleTimeString().split(":")
            const Time = new Date();
            Time.setHours(Number(fullTimeMas[0]),0,0)
            Time.setMinutes(Number(fullTimeMas[1])+30,0,0)
            Time.setSeconds(0,0,0)
            const timeToId = await myController.findTime(Time)

            //Делаем запись
            const record = await myController.createRecord(pacient.id,doctor.id,slots.id,timeToId.id,fullDateSlots)

           if (record){
                return res.status(200).json({message:"Вы успешно записаны"})
           }
           else{
            return res.status(401).json({message:"Поробуйте еще раз"})
           }
        } catch (error) {
            res.status(401).json({message:error.message})
        }
    }
);
/**
 * Запрос для получения слотов у врача на определенную дату
*/
router.get(
    "/getSlots/:date/:doctorsID",
    [], 
    async (req,res)=>{
        try {
            /**
             * Не очень реализация метода, поменять запрос надо на JOIN
             * 
            */
            const myController = new controller();
            //Получаем все записи доктора на указынную дату
            const recordsForDoctors =  await myController.getRecords(req.params.date,req.params.doctorsID)
            //Получаем слоты, которые у нас могут быть
            const slotsForDoctors = await myController.getTimes();
            let resM = []

            //Проверям занят ли слот у врача
            slotsForDoctors.forEach(element => {
                let isFree = true
                for(let i =0; i<recordsForDoctors.length;i++){
                    if(recordsForDoctors[i].time_from_id == element.id){
                        isFree = false
                        break
                    }
                }
                let obj = {}
                obj.id = element.id
                obj.time = element.time.toISOString().split("T")[1].split(":00.000Z")[0],
                obj.isFree = isFree? "Cвободно": "Занято"
                resM.push(obj)
            });
           
            return res.status(200).json(resM)
        } catch (error) {
            return res.status(401).json({message:error.message})
        }
    }
);


/**
 * Запрос, чтобы добавить в БД докторов
*/
router.post("/addDoctors",[],async(req,res) =>{
    try {
        const dataDoctors = [{name:"Сергей", spec:"Терапевт", price: 2000},
                            {name:'Иван', spec:"Терапевт",price: 2200},
                            {name:'Петр', spec:"Хирург", price:2500},
                            {name:"Илья",spec:"Хирург",price:2700}]
        const myController = new controller();
        for(let i = 0; i<dataDoctors.length;i++){
            const user  = await myController.createDoctor(dataDoctors[i]);
            console.log(user);
        }

        return res.status(200).json({message: "Доктора успешно добавлены!"})

    } catch (error) {
        return res.status(401).json({message:error.message});
    }
})


//export default router;
module.exports = router;