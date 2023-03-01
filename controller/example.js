module.exports = {
    STATUSES: {
        MIA_CALL_STATUSES: {
            /**
             * `Статус №10`
             *
             * **Нет соединения**
             */
            NO_CONNECTION: 10,

            /**
             * `Статус №11`
             *
             * **Соединение**
             */
            CONNECTION_11: 11,

            /**
             * `Статус №12`
             *
             * **Соединение*
             */
            CONNECTION_12: 12,

            /**
             * `Статус №20`
             *
             * **В процессе**
             */
            IN_PROCESS: 20,

            /**
             * `Статус №21`
             *
             * **Окончен абонентом**
             */
            ENDED_BY_THE_SUBSCRIBER: 21,

            /**
             * `Статус №210`
             *
             * **Окончен абонентом (перезвон)**
             */
            ENDED_BY_THE_SUBSCRIBER_RECALL: 210,

            /**
             * `Статус №22`
             *
             * **Окончен (автоответчик)**
             */
            AUTO_ANSWER_ENDED: 22,

            /**
             * `Статус №23`
             *
             * **Окончен по сценарию**
             */
            FINISHED_ACCORDING_TO_THE_SCENARIO: 23,

            /**
             * `Статус №230`
             *
             * **Окончен по сценарию (перезвон)**
             */
            FINISHED_ACCORDING_TO_THE_SCENARIO_RECALL: 230,

            /**
             * `Статус №31`
             *
             * **Переведён (сценарий)**
             */
            TRANSFERRED_TO_SCENARIO: 31,

            /**
             * `Статус №32`
             *
             * **Переведён (оператор)**
             */
            TRANSFERRED_TO_OPERATOR: 32,

            /**
             * `Статус №33`
             *
             * **Технический перевод**
             */
            TECHNICAL_TRANSLATION: 33,

            /**
             * `Статус №34`
             *
             * **Техническое завершение**
             */
            TECHNICAL_COMPLETION: 34,

            /**
             * `Статус №40`
             *
             * **Неизвестно**
             */
            UNKNOWN: 40
        }
    }
}
