const nodemailer = require('nodemailer')
const cron = require('node-cron')
const controller = require('./db.controller')
const Mail = require('nodemailer/lib/mailer')


class EmailController{
    async sendEveryHours(){ 
         cron.schedule('*/1 * * * * *', async function(){
            const myController = new controller()
            //Определить текущее время и прибавить два часа
            const timeNow = new Date()
            const tmp = timeNow.toISOString().split("T")[0]
            if(timeNow.getMinutes()==0 || timeNow.getMinutes()==30){

                //Найти все записи через два часа
                timeNow.setHours(timeNow.setHours(timeNow.getHours()+2))
                const res = await myController.selectRecords(1, tmp, timeNow);
                let transporter  =  nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user: "kablixin2018@gmail.com",
                        pass: "pass",
                    },
                })
                ///Обойти массив и отпраить письма
                for(let i=0;i<res.length;i++){
                    const spec = res[i].doctors.spec
                    const name = res[i].patient.name
                    const email = res[i].patient.email
                    console.log("asdasd")
                    let result = await transporter.sendMail({
                        from:'kablixin2018@gmail.com',
                        to: email,
                        subject: "Запись к врачу",
                        text:`Привет ${name}! Через 2 часа у вас приём у ${spec}a!`
                    })
                    console.log("sadasdr",result)
                }
                
            }
            myController.closeConnection()
            
        })
    }
    async sendEveryDay(){
        cron.schedule('*/1 * * * * *', async function(){
            const myController = new controller()
            //Определить текущую дату и прибавить два дня
            const timeNow = new Date()
            timeNow.setDate(timeNow.getDate()+2)
            const tmp = timeNow.toISOString().split("T")[0]

            //Выполнить запрос
            const res = await myController.selectRecords(2,tmp);
            let transporter  =  nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user: "kablixin2018@gmail.com",
                    pass: "pass",
                },
            })
            ///Обойти массив и отпраить письма
            for(let i=0;i<res.length;i++){
                const spec = res[i].doctors.spec
                const name = res[i].patient.name
                const email = res[i].patient.email
                console.log("asdasd")
                let result = await transporter.sendMail({
                from:'kablixin2018@gmail.com',
                    to: email,
                    subject: "Запись к врачу",
                    text:`Привет ${name}! Через 2 часа у вас приём у ${spec}a!`
                })
            }

            myController.closeConnection()
        })
    }
}

module.exports = EmailController;