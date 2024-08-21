# Дипломный проект на курсе «Backend-разработка на Node.js»

## Running the app
```bash
# Run docker container on development with watch mode
$ docker-compose up

# Create and run docker container on production
$ docker build -t app-name . && docker run app-name -p 8080:3000
```