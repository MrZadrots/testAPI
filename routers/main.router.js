const express = require('express')
const bcrypt = require('bcrypt')
const {check, validationResult} = require('express-validator')
const router = express.Router();

//import {ControllerDb} from "../controller/db.controller"
const controller = require('../controller/db.controller')

/**
 * Запрос для добавления пациента
 * На вход ожидает JSON В виде:
 * {
 *  "phone": "+79137432421",
    "name": "Артем",
    "email": "email@list.ru",
    "gender": "male",
 * }
 * 
 */
router.post(
    "/register",
    [
        check("phone","Неверный номер телефона").isLength({min:7}).isMobilePhone(),
        check("name","Невреное имя. Пожалуйста, введите действительное имя").isLength(3).isString(),
        check("email","Неверный адресс электронной почты").notEmpty().isEmail(),
        check("gender","Невреный пол").notEmpty().isString().isIn(['male','female']),
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
            console.log(!user)
            if(user.length !=0){
                await myController.closeConnection();
                return res.status(400).json({message:"Пользователь с таким номером телефона или почтой уже существует!"})
            }

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
 *  * На вход ожидает JSON В виде:
 * {
 *  "pacient_id":3,
	"doctor_id":4,
	"scedule_id":9,
	"date_slots": "19.02.2023"
 * }
 * 
 */
router.post(
    "/add/",
    [], 
    async (req,res)=>{
        try {
            const {pacient_id,doctor_id,scedule_id,date_slots} = req.body;
            const myController = new controller();
            //Найти время 
            const slots = await myController.findTimeById(scedule_id)
            const fullDateSlots = new Date()
            const date_slotsMas = date_slots.split('.');
            fullDateSlots.setFullYear(Number(date_slotsMas[2]))
            fullDateSlots.setMonth(Number(date_slotsMas[1]),0,0)
            fullDateSlots.setDate(Number(date_slotsMas[0],0,0))
            fullDateSlots.setMinutes(0,0,0)
            fullDateSlots.setSeconds(0,0,0)
            //Смотрим день недели
            let days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
            if(days[fullDateSlots.getDay()]=="СБ"|| days[fullDateSlots.getDay()]=='ВС'){
                return res.status(201).json({message:"Это выходной! Выберите другой день!"})
            }

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
            
            console.log("Проверяю время")
            //Проверяем свободно ли время
            const check = await myController.checkTime(doctor.id,slots.id,fullDateSlots)
            if(check.length!=0){
                return res.status(401).json({message:"Время у врача занято! Выберите другое."})
            }
            console.log("Проверил время", check)
            //Считаем время до конца записи(timeTo)
            const currentTimeZone = new Date().getTimezoneOffset()/60
            console.log("currentTineZone",currentTimeZone)
            console.log("slotsTime",slots.time.getHours()+currentTimeZone)
            const fullTimeMas = slots.time.toLocaleTimeString().split(":")
            console.log("fullTimeMas", fullTimeMas)
            const Time = new Date();
            /*Time.setHours(Number(fullTimeMas[0]),0,0)
            Time.setMinutes(Number(fullTimeMas[1])+30,0,0)
            Time.setSeconds(0,0,0)*/
            Time.setHours(slots.time.getHours(),0,0)
            Time.setMinutes(slots.time.getMinutes()+30,0,0)
            Time.setSeconds(0,0,0)
            console.log("Time", Time.toLocaleTimeString())
            console.log("TimeISO", Time.toISOString())
            const timeToId = await myController.findTime(Time)

            //Делаем запись
            const record = await myController.createRecord(pacient.id,doctor.id,slots.id,timeToId.id,fullDateSlots)
            myController.closeConnection()
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
 * Example:
 * /getSlots/2023-11-07/1
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
            console.log("ADSDASDASDSDS", req.params.date);
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
            await myController.closeConnection()
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
        await myController.closeConnection()
        return res.status(200).json({message: "Доктора успешно добавлены!"})

    } catch (error) {
        return res.status(401).json({message:error.message});
    }
})
/**
 * Запрос для создания шаблона
 * 
 */
router.get("/createSample",[],async (req,res)=>{
    try {
        const timeMassive = ['9:00','9:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
        '16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00']
        const myController = new controller();
        
        const check = await myController.getTimes();

        if( check.length!=0){
            return res.status(401).json({message:"Шаблон уже заполнен!"})
        }
        timeMassive.forEach(async elem =>{
                    
            const time = new Date();
            const hours = elem.split(':')[0];
            const minutes = elem.split(':')[1] 
            time.setSeconds(0,0)
            time.setHours(Number(hours)+7)
            time.setMinutes(Number(minutes))
            const resM = await myController.createSample(time)   
        })
        await myController.closeConnection()
        return res.status(201).json({message:"Успешно"})
    } catch (error) {
        return res.status(401).json({message:error.message})
    }
})

/**
 * Запрос, чтобы получить шаблон слотов
 */

router.get('/getSample',[], async (req,res)=>{
    try {
        const myController = new controller()
        const resultsM = await myController.getTimes();
        resultsM.forEach(e => {
            e.time = e.time.toISOString().split("T")[1].split(":00.000Z")[0]
        })
        await myController.closeConnection()
        return res.status(200).json(resultsM)
    } catch (error) {
        return res.status(401).json({message:error.message})
    }
})

router.get('/timeId/:timeH/:timeM',[], async (req,res)=>{
    try {
        const parsedDateFromHours = req.params.timeH
        const parsedDateFromMinutes = req.params.timeM
        const Time = new Date()
        const currentTimeZone = Time.getTimezoneOffset()/60
        console.log("currentTimeZone",currentTimeZone)
        Time.setHours(Number(parsedDateFromHours)-currentTimeZone,0,0)
        Time.setMinutes(Number(parsedDateFromMinutes),0,0)
        Time.setSeconds(0,0,0)
        console.log("Hours", Time.getHours())
        console.log("TimeISO", Time.toISOString())

        console.log("Time on fun to req db", Time)
        const myController = new controller()
        const timeObj = await myController.findTime(Time)
        console.log("Time on req to db", timeObj)
        await myController.closeConnection()
        if(timeObj== null){
            return res.status(401).json({message: "Такого времени нет"})
        }
        return res.status(200).json({message:timeObj})
    } catch (error) {
        return res.status(401).json({message:error.message})
    }
})

/***
 * 
 * Получить актуальные задачи для оповещения 
 * 
 ***/
router.get('/getTasks', [], async(req,res)=>{
    try {
        console.log("============")
        console.log("Я начал выполнять запрос /getTasks")
        const myController = new controller()
        const result = await myController.getTasks()
        console.log("Вот что я получил из БД", result)
        console.log("============")
        await myController.closeConnection()
        return res.status(200).json({message: result})
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
})
/**
 * Обновить таблицу звонки
 * 
 * 
 */
router.post('/update',[],async (req,res)=>{
    try {
        console.log("==============")
        console.log("Я начал выполнять запрос /update")
        const inputData = req.body.data
        const myController = new controller()
        console.log("Я получил данные ", inputData)

        const result = await myController.updateCalls(inputData)

        console.log("Я выполнил запрос /update", result)
        console.log("==============")
        await myController.closeConnection()
        return res.status(200).json({message:"Успешно"})
        
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
})

/***
 * 
 * 
 */
router.post("/updateTasks",[], async (req,res)=>{
    try {
        const data = req.body.data
        const myController = new controller()
        console.log("==============")
        console.log("Я начал выполнять запрос")
        console.log("data", data)
        const result = await myController.updateTask(data)
        console.log("Я выполнил запрос updateTasks")
        console.log("==============")
        await myController.closeConnection()
        return res.status(200).json({message:"Успешно"})

    }
    catch(error){
        return res.status(400).json({message:error.message})
    }
})

router.get("/getCalls", [], async (req, res)=>{
    try {
        const myController = new controller()
        const result = await myController.getCalls()
        await myController.closeConnection()
        return res.status(200).json({message:result})
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
})

router.get("/updateStatusCalls", [], async (req,res)=>{
    try {
        console.log("==============")
        console.log("Я начал выполнять запрос updateStatusCalls")
        const myController = new controller()
        const result = await myController.updateCallsStatus(req.body.data)
        await myController.closeConnection()
        console.log("result", result)

        console.log("==============")
        console.log("Я закончил выполнять запрос updateStatusCalls")
        return res.status(200).json({message:"Успешно"})

    } catch (error) {
        return res.status(400).json({message:error.message})
    }
})

router.get('/updateStatusTasks', [], async (req, res)=>{
    try {
        console.log("============")
        console.log("Я начал выполнять запрос updateStatusTasks")
        const myController = new controller()
        const result = await myController.updateTasksStatus(req.body.data)
        await myController.closeConnection()

        console.log("============")
        console.log("Я закончил выполнять запрос updateStatusTasks")

        return res.status(200).json({message:"Успешно"})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
})
module.exports = router;