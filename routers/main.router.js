const express = require('express')
const bcrypt = require('bcrypt')
const {check, validationResult} = require('express-validator')
const router = express.Router();

router.post(
    "/register",
    [
        check("phone","Неверный номер телефона").isLength({min:7}).isMobilePhone(),
        check("name","Невреное имя. Пожалуйста, введите действительное имя").isLength(3).isString(),
        check("email","Неверный адресс электронной почты").notEmpty().isEmail(),
        ///А ТЕКСТ ЛИ?
        check("gender","Невреный пол").notEmpty().isString(),
        check("password","Неккоректный пароль").isString().isLength({min:4})
    ], 
    async (req,res)=>{
        try {
            const dataUser = {...req.body};
            

            const errors = await validationResult(req)
            if (!errors.isEmpty())
                return res.status(401).json({
                    errors: errors.array(),
                    message:errors.array()[0].msg
                })
            //Проверить наличие пользователя в БД
            
            //Добавить нового пользователя
            const passwordHasher = await bcrypt.hash(dataUser.passwordHasher,12);
            dataUser.password = passwordHasher;


            return res.status(200).json({message:"Вы успешно добавлены"});
        } catch (error) {
            return res.status(500).json({message:error.message});
        }

    }
);
router.get(
    "/add",
    [], 
    async (req,res)=>{
        
    }
);
router.get(
    "",
    [], 
    async (req,res)=>{
        
    }
);



//export default router;
module.exports = router;