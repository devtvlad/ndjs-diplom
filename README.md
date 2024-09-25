# Дипломный проект на курсе «Backend-разработка на Node.js»

> Дипломный проект представляет собой сайт-агрегатор просмотра и бронирования гостиниц. Ваша задача заключается в разработке бэкенда для сайта-агрегатора с реализацией возможности бронирования гостиниц на диапазон дат.

## Зависимости
[Nest](https://github.com/nestjs/nest) - Framework TypeScript starter repository; \
[Mongoose](https://www.npmjs.com/package/mongoose) - Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment; \
[Multer](https://www.npmjs.com/package/multer) - Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files; \
[Passport-jwt](https://www.npmjs.com/package/passport-jwt) - A Passport strategy for authenticating with a JSON Web Token; \
[Socket.io](https://www.npmjs.com/package/socket.io) - Socket.IO enables real-time bidirectional event-based communication.

## API
Метод | URL | Действие | Комментарий
--- | --- | --- | ---
`POST` | `/api/auth/login` | Аутентификация пользователей | Доступно только не аутентифицированным пользователям
`POST` | `/api/auth/logout` | Выход из системы | Доступно только аутентифицированным пользователям
`POST` | `/api/client/register` | Регистрация клиентов | Позволяет создать пользователя с ролью `client` в системе
`POST` | `/api/admin/users` | Создать пользователя | Позволяет пользователю с ролью `admin` создать пользователя в системе
`GET` | `/api/admin/users/` | Получить всех пользователей для админа | Позволяет пользователю с ролью `admin` получить массив всех пользователей
`GET` | `/api/manager/users/` | Получить пользователей для менеджера | Позволяет пользователю с ролью `manager` получить массив всех пользователей
`GET` | `/api/common/hotel-rooms/` | Получить все номера отелей | Поиск номеров отелей с фильтрацией по параметрам
`GET` | `/api/common/hotel-rooms/:id` | Получить номер отеля по **ID** | Получение информации о номере отеля по его **ID**
`POST` | `/api/admin/hotels/` | Создать отель | Позволяет пользователю с ролью `admin` создать отель
`GET` | `/api/admin/hotels/` | Получить список отелей | Позволяет пользователю с ролью `admin` получить массив всех отелей
`PUT` | `/api/admin/hotels/:id` | Обновить отель по **ID** | Позволяет пользователю с ролью `admin` обновить отель по его **ID**
`POST` | `/api/admin/hotel-rooms/` | Создать номер отеля | Позволяет пользователю с ролью `admin` создать номер отеля
`PUT` | `/api/admin/hotel-rooms/:id` | Обновить номер отеля по **ID** | Позволяет пользователю с ролью `admin` обновить номер отеля по его **ID**
`POST` | `/api/client/reservations/` | Создать бронь | Позволяет пользователю с ролью `client` создать бронь
`GET` | `/api/client/reservations/` | Получить все брони клиента | Позволяет пользователю с ролью `client` получить массив всех своих бронирований
`DELETE` | `/api/client/reservations/:id` | Удалить бронь по **ID** | Позволяет пользователю с ролью `client` удалить бронь по ее **ID**
`GET` | `/api/manager/reservations/:userId` | Получить брони клиента для менеджера | Позволяет пользователю с ролью `manager` получить массив всех бронирований клиента по его **ID**
`DELETE` | `/api/manager/reservations/:id` | Удалить бронь по **ID** для менеджера | Позволяет пользователю с ролью `manager` удалить бронь по ее **ID**
`POST` | `/api/client/support-requests/` | Создать запрос в поддержку | Позволяет пользователю с ролью `client` создать запрос в поддержку
`GET` | `/api/client/support-requests/` | Получить запросы в поддержку клиента | Позволяет пользователю с ролью `client` получить массив всех своих запросов в поддержку
`GET` | `/api/manager/support-requests/` | Получить запросы в поддержку менеджера | Позволяет пользователю с ролью `manager` получить массив всех запросов в поддержку
`GET` | `/api/common/support-requests/:id/messages` | Получить сообщения по **ID** запроса в поддержку | Позволяет пользователю с ролью `manager` или `client` получить массив всех сообщений по **ID** запроса в поддержку
`POST` | `/api/common/support-requests/:id/messages` | Отправить сообщение по **ID** запроса в поддержку | Позволяет пользователю с ролью `manager` или `client` отправить сообщение по **ID** запроса в поддержку
`POST` | `/api/common/support-requests/:id/messages/read` | Прочитать сообщения в поддержке | Позволяет пользователю с ролью `manager` или `client` отметить сообщение или сообщения как прочтенные по **ID** запроса в поддержку

## Требования
Должны быть установлены [Node.js](https://nodejs.org/) & [Docker](https://www.docker.com)

## Запуск приложения
```bash
# Run docker container on development with watch mode
$ docker compose up
```