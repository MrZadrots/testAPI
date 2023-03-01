
const axios = require("axios")

const stringDate = "2023-03-01"
axios({
    method:"GET",
    url:`https://7e00-37-195-66-225.eu.ngrok.io/api/getSlots/${stringDate}/1`,
    headers: {
            "Content-type": "application/json; charset=UTF-8"
    }
}).then(res=>{
    let resM = []
    let flag = true
    let start,end
    console.log(typeof(res.data))
    console.log(res.data)
    res.data.forEach((element,i) => {
        console.log("Начали цикл", flag)
        console.log("Check", element.isFree.includes("Cвободно"))
        if(element.isFree.includes("Cвободно") && flag == true){
            console.log("Зашли в блок свободно")
            start = element.time
            console.log("Нашел свободное время",start)
            flag = false
        }
        else if (element.isFree.includes("Занято") && !flag){
            console.log("Зашли в блок занято")
            end = res.data[i-1].time
            resM.push([start,end])
            flag = true
        }
        else if(i==res.data.length-1){
            console.log("Зашли в последнее условие")
            resM.push([start, res.data[i-1].time])

        }
    });

    let resultString = 'Вы можете записаться в следующее время с интервалом 30 минут'
    resM.forEach(el =>{
        resultString += ` c ${el[0]} до ${el[1]}`
    })

    console.log(resultString)
    //console.log("MY RESPONSE", res)
    console.log("RESULT MY Script", resM)
}).catch(err => {
    console.log("MY ERROR", err)
})