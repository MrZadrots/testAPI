///API key 1354556d-a64c-46d3-9457-0cd6d6208ade
/*
 * 1. Получить номер для прозвона 
 * 2. Отправить дозвон
 * 3. Сохранить данные в таблицу calls
 * 
 * 
 */

const axios = require('axios')
require('dotenv').config();
const url = "https://271a-37-195-66-225.eu.ngrok.io"
const STATUSES = require('./example')

const createCalls = async () => {

    const res = await axios({
        method:"GET",
        url: `${url}/api/getTasks`,
        headers:{
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    if (res.status === 200){
        console.log("Вот что я получил из БД", res.data.message)
        const telephoneList = []
        const tasksIDList = []
        res.data.message.forEach(element => {
            telephoneList.push({phone:element.phone,
            data: JSON.stringify({information: element.information})})
            tasksIDList.push({id:element.id,count:element.countCall})
        });

        console.log("Я создал массив телефонов", telephoneList)
        
        if(telephoneList.length){
            console.log("Я создаю запрос в API")
            const dataForApi = JSON.stringify({
                api_key: process.env.api_key,
                project_id:"185",
                data: JSON.stringify(telephoneList)
            })
            console.log("Я подготовил данные для отправки", dataForApi)
            const resultForApi = await axios({
                method:"POST",
                url: "https://go.robotmia.ru/api/calltask/bulk", 
                data: dataForApi,
                headers:{
                    "Content-Type":"application/json"
                } 
            })
            console.log("Я отправил запрос в API", resultForApi)

            if(resultForApi.status === 200){
                console.log("Запрос отправлен успешно!", resultForApi.data)
                console.log("Stringify", JSON.stringify(resultForApi.data))
                ///Подготовим даннные для записи

                const updateData = []
                const bulkId = resultForApi.data.bulk_id


                const tmp = Object.values(resultForApi.data)
                tmp.forEach((e,i)=>{
                    if(typeof(e)==='object'){
                        updateData.push({
                            id: tasksIDList[i].id,
                            phone: telephoneList[i].phone,
                            call_taskId:e.data.call_task_id,
                            bulk_id: bulkId,
                            result: "IN process",
                            status:'process'
                        })
                    }
                })

                console.log("Я подготовил данные для записи в БД", updateData)
                console.log("Я отправляю запрос для обновления таблицы Calls")
                const resultUpdate = await axios({
                    method:"POST",
                    url:`${url}/api/update`,
                    data:{data:updateData},
                    headers:{
                        "Content-Type":"application/json"
                    }
                })
                if (resultUpdate.status === 200){
                    console.log("Результат работы запроса ", resultUpdate.data.message)

                    const resultUpdateTasks = await axios({
                        method:"POST",
                        url:`${url}/api/updateTasks`,
                        data:{data:tasksIDList},
                        headers:{
                            "Content-Type":"application/json"
                        }
                    })
                    if(resultUpdateTasks.status ===200){
                        console.log("Результат обновления тасков ", resultUpdateTasks.data.message)
                    }
                    else{
                        console.log("Результат обновления тасков ", resultUpdateTasks.response.data.message)
                    }
                }
                else{
                    console.log("Результат работы запроса ", resultUpdate.response.data.message)
                }
            }

        }


    }



    else{
        console.log(res.response.data)
    }
}


const checkCalls  = async () =>{
    console.log("==========")
    console.log("Я начал выполнять функцию checkCalls")
    const callsInProgress = await axios({
        method:"GET",
        url: `${url}/api/getCalls`,
        headers: {

        }
    })
    console.log("Я получил все активные звонки ", callsInProgress.data.message)
    const callsInProgressList= callsInProgress.data.message


    if(callsInProgressList.length){
        const listCallsId = []
        callsInProgressList.forEach(el => {
            listCallsId.push(Number(el.idCallTask))
        })
        ///Подготовка данных для отправки запроса на API
        const dataToApiGetResult = {
            api_key: process.env.api_key,
            project_id: process.env.project_id,
            call_task_ids: listCallsId
        }

        console.log("Я подготовил данные для отправки их на сервер ", dataToApiGetResult)

        const resForApiGetResult = await axios({
            method: "POST",
            url: "https://go.robotmia.ru/api/calltask/result-bulk",
            headers:{
                "Content-Type": "application/json"
            },
            data: JSON.stringify(dataToApiGetResult)
        })
        console.log("Я получил ответ от сервера ", resForApiGetResult.data.data)
        if(resForApiGetResult.status ===200){
            updateData = []
            const tmp = Object.values(resForApiGetResult.data.data)
            console.log("TMP", tmp)
            tmp.forEach((el, i )=> {
                const resUpdateObj = {}
                resUpdateObj.id = callsInProgressList[i].id
                if(!tmp.hasOwnProperty('errors')){
                    resUpdateObj.isDone = 0 
                    if(el.status === 23 ||el.status === 21 || el.status ===210 || el.status===22 || el.status===230){
                        resUpdateObj.status = "done"
                        resUpdateObj.isDone = 1 
                        resUpdateObj.isActual = 0 
                        resUpdateObj.information = el.data.information
                    }
                    else{
                        resUpdateObj.status = 'process'
                    }
                    
                    resUpdateObj.phone = el.phone_number
                    
                    
                }
                updateData.push(resUpdateObj)
            })

            console.log("Я подготовил данные для обновления БД", updateData)

            //Отправить данные для обновлени calls

            const resultApiUpdCalls = await axios({
                method: "GET",
                url: `${url}/api/updateStatusCalls`,
                data: {data:updateData},
                headers: {
                    "Content-Type": "application/json"
                }
            })

            //Отправить данные для обновлени Tasks
            const resultApiUpdTasks = await axios({
                method: "GET",
                url: `${url}/api/updateStatusTasks`,
                headers:{
                    "Content-Type": "application/json"
                },
                data: {data:updateData}
            })
            //console.log("Я выполнил запрос ", resultApiUpd)
        }
    }
    else{
        console.log("Активных звонков нет.\n Завершаю работы функции checkCalls\n==============")
    }
}

//createCalls()

//checkCalls()
//createCalls()
module.exports = {createCalls, checkCalls}

