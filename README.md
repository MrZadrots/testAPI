# testAPI
Для запуска приложения необходимо:
1) Выполнить команду "npm i"
2) Создать файл .env с полем DATABASE_URL вида:
  "mysql://username:password@IP:PORT/mydb?schema=public"
3) Выполнить миграцию: npx prisma migrate dev --name init
4) Запустить командой npm run start
5) Заполнить базы данных(таблицы "Doctors", "TimeSample"), выполнив два запроса GET createSample и GET addDoctors
6) Для работы отправки сообщений, необходимо добавить в файле config/default значение своей электронной почты и пароля
