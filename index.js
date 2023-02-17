const express = require("express")
const config = require("config")

const app = express();
//Добавление поддержку json
app.use(express.json({extended:true}))
//Подключаем основной роутер по адресу "api"
app.use('/api',require('./routers/main.router'))


//Функция запуска сервера
function RunApp(){
    try {
        //Подтягиваем порт из конфига, в случае ошибки устанавливаем 5000
        const PORT = config.get("PORT") || 5000;
        //Старт сервера
        app.listen(PORT, ()=> console.log(`Server is started on ${PORT}`))
    } catch (error) {
        console.log("Server error! ", error.message);
        process.exit(1);
    }   
};


RunApp();