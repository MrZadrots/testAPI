const {createCalls,checkCalls} =  require("./callsScripts")
const cron = require('node-cron')
let flag = false



const cronCheckCalls = async ()=> {
    cron.schedule('*/25 * * * * * ', async function (){
        console.log("------------------")
        console.log("Я начал выполнять крон cronCreateCalls")
        if(flag){
            return
        }
        flag = true
        await createCalls()

        console.log("Я закончил выполнять крон cronCreateCalls")
        console.log("------------------")
        flag = false
    })

    cron.schedule('*/10 * * * * * ', async function (){
        console.log("+++++++++++")
        console.log("Я начал выполнять крон checkCalls")

        if(flag){
            return
        }
        flag = true
        await checkCalls()
       

        console.log("+++++++++++")
        console.log("Я закончил выполнять крон checkCalls")
        flag = false
        
    })
    
}

const cronCreateCalls = async ()=> {

    
    
}

cronCheckCalls()
//cronCreateCalls()