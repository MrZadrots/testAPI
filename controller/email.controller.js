const nodemailer = require('nodemailer')
const cron = require('node-cron')
const controller = require('./db.controller')
const config = require('config')

class EmailController{
    async sendEveryHours(){ 
         cron.schedule('0,30 * * * *', async function(){
            const myController = new controller()
            //Определить текущее время и прибавить два часа
            const timeNow = new Date()
            const tmp = timeNow.toISOString().split("T")[0]

            timeNow.setSeconds(0,0,0)
            //Найти все записи через два часа
            const currentTimeZone = timeNow.getTimezoneOffset()/60

            timeNow.setHours(timeNow.getHours()+2-currentTimeZone)

            const res = await myController.selectRecords(1, tmp, timeNow);
            let transporter  =  nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user: config.get("from"),
                    pass: config.get('pass'),
                },
            })
            ///Обойти массив и отпраить письма
            for(let i=0;i<res.length;i++){
                const spec = res[i].doctors.spec
                const name = res[i].patient.name
                const email = res[i].patient.email
                const time  = await myController.findTimeById(res[i].time_from_id)
                const timeString = time.time.toISOString().split('T')[1].split(':00.000Z')[0]
                let result = await transporter.sendMail({
                    from: config.get("from"),
                    to: email,
                    subject: "Запись к врачу",
                    text:`Привет ${name}! Через 2 часа у вас приём у ${spec}a в ${timeString}!`
                })
                }
            myController.closeConnection()
            
        })
    }
    async sendEveryDay(){
        cron.schedule('* * 1 * * *', async function(){
            console.log("Начал выполнять крон")
            const fromE = config.get("from")
            const myController = new controller()
            //Определить текущую дату и прибавить два дня
            const timeNow = new Date()
            timeNow.setDate(timeNow.getDate()+1)
            const tmp = timeNow.toISOString().split("T")[0]
            console.log("TMP", tmp)
            //Выполнить запрос
            const res = await myController.selectRecords(2,tmp);
            //console.log('res', res)

            
            ///Обойти массив и отпраить письма
            for(let i=0;i<res.length;i++){
                const spec = res[i].doctors.spec
                const name = res[i].patient.name
                const email = res[i].patient.email
                const time  = await myController.findTimeById(res[i].time_from_id)
                const timeString = time.time.toISOString().split('T')[1].split(':00.000Z')[0]
                console.log("ОТправляю письмо", email)
                console.log("Time for Slots", timeString)
                let transporter  =  nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user: fromE,
                        pass: config.get('pass'),
                    },
                })
                console.log("Cоздал транс")
                let result = await transporter.sendMail({
                    from: fromE,
                    to: email,
                    subject: "Запись к врачу",
                    text:`Привет ${name}! Напоминаем что вы записаны к ${spec}у завтра в ${timeString}!`
                })
                console.log("Отправил письмо")
                console.log(result)
            }

            myController.closeConnection()
        })
    }
}

module.exports = EmailController;