const axios = require("axios")

const parsedDateFrom = {"year":"2023","month":2,"day":28,"hours":"15","minutes":"30","monthSpeech":"февраля","daySpeech":"двадцать восьмого"}



axios({
    method:"GET",
    url:`https://7e00-37-195-66-225.eu.ngrok.io/api/timeId/${parsedDateFrom.hours}/${parsedDateFrom.minutes}`,
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
}).then(async (res)=>{
    console.log("RESPONSE", res.data)
    /*v.schedule_id = res.data.message.id
    v.pacient_id = 3
    v.doctors_id =1 */
    const result2 = await axios({
        method:"POST",
        url:`https://7e00-37-195-66-225.eu.ngrok.io/api/add`,
        data:{
            pacient_id: 3,
            doctor_id: 1,
            scedule_id:15,
            date_slots:`28.2.2023`
        },
        headers: {
                    "Content-type": "application/json; charset=UTF-8"
            }
    })
    console.log()

    console.log(res.data.message.id)
}).catch(err=>{
    //console.log(err)
    if(err.response){
        console.log(err.response.data.message)
        console.log(err.response.status )
    }
    else if(err.request){
        console.log(err.request)
    }
})
