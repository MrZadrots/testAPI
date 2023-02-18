const express = require('express')
const bcrypt = require('bcrypt')
const {check, validationResult} = require('express-validator')
const router = express.Router();
//import {ControllerDb} from "../controller/db.controller"
const controller = require('../controller/db.controller')


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

router.get(
    "/add/:patient_id/:doctor_id/:scedule_id",
    [], 
    async (req,res)=>{
        try {
            console.log(req.params.patient_id)
            console.log(req.params.doctor_id)
            console.log(req.params.scedule_id)
            const myController = new controller()
            //Проверить есть ли такой пациент
            const pacient = await myController.findUserById(req.params.patient_id)
            if(pacient.length == 0){
                return res.status(401).json({message: "Такого пациента не существует"})
            }
            //Проверить есть ли такой врач
            const doctor = await myController.findDoctorsById(req.params.doctor_id)
            if(doctor.length == 0){
                return res.status(401).json({message: "Такого доктора не существует"})
            }
            //Найти время 
            const slots = await myController.findTimeById(req.params.scedule_id)
            

            //Проверяем свободно ли время
            const check = await myController.checkTime(doctor.id,slots.id)
            if(check.length!=0){
                return res.status(401).json({message:"Время у врача занято! Выберите другое."})
            }
            
            //Считаем время до конца записи(timeTo)ГОНОКОД
            const tmp = slots.time.toISOString().split('T')[1].split('.')[0]
            const timeTo = tmp.split(':')[1] =='30' ? Number(tmp.split(':')[0])+1 + ':00:00' : Number(tmp.split(':')[0]) + ':30:00'
            const Time = new Date();

            Time.setHours(Number(timeTo.split(':')[0])+7,timeTo.split(':')[1],0);


            console.log("TIME",Time.getHours(),Time.getMinutes(),Time.getSeconds())
            console.log(Time.toISOString())
            //const record = await myController.createRecord(pacient.id,doctor.id,slots.id)
            console.log(pacient.phone,doctor.name,slots.time)
            const timeToId = await myController.findTime(Time)

            console.log("ASDASdASdasda",timeToId)
            return res.status(201).json({message:"Вы успешно записаны"})
        } catch (error) {
            res.status(401).json({message:error.message})
        }
    }
);
router.get(
    "",
    [], 
    async (req,res)=>{
        
    }
);



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