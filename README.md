<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
  <h1 align="center">Sky Krono API NestJS</h1>
  <p align="center">Es el API REST para la WebAPP/PWA SkyKrono integrado con Web Authentication para el inicio de sesion passworless</p>
<p align="center">
 
<img src="https://badgen.net/badge/Built%20With/TypeScript/bl" alt="Build With TypeScript" />
<img src="https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg" alt="Build With TypeScript" />
</p>

## :ledger: Index

- [Pre-Requisitos](#pre-requisitos-)
- [Instalación](#instalación-)
  - [Scripts SQL](#Scripts-SQL)
  - [Environment](#Environment)
- [Desarrollo](#desarrollo-%EF%B8%8F)
  - [Unit-Test](#unit-test)
  - [Build](#build)
- [Despligue](#despliegue-)  
- [Analisis de Codigo](#analisis-de-codigo-)
- [Integración Continua](#integración-continua)
- [Logger](#logger)
- [Documentación](#documentacion)
- [Construido](#construido-con-)

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

## Pre-Requisitos 📋

_Software requerido_

```
NodeJS >= 14.X
NPM >= 8.X
NestJS >= 9.X
MySQL >=8.X
```

_Software opcional_

```
Visual Studio Code ( O el editor de su preferencia)
```

## Instalación 🔧

_Para ejecutar un entorno de desarrollo_

_Previamente ejecutar el comando en la terminal para descargar "node_modules" para el funcionamiento del proyecto_

```
 npm install
```

_Previamente a ejecutar el servidor en desarrollo configurar el archivo .env con las credenciales del servidor correos y base de datos , ejecutar :_

```
 npm run start:dev
```

_Dirigirse a la ruta http://localhost:3000/ donde tendra el API REST levantada_

### Scripts SQL

_Se tiene el archivo ```script.sql``` en la raiz del proyecto , el cual contiene los scripts de creacion de Store Procedure y Events/Jobs en MySQL_

_Se requiere ejecutar para el correcto funcionamiento de las tareas programadas como registro de licencias , dias libres de los trabajadores_

![Scripts SQL](/docs/sql/sql.png)

### Environment

_Se tiene el archivo ```env.template``` , el cual posee un ejemplo de cada valor de las valores de entorno para poder desplegarlas en nuestro propio ambiente local o cloud_

![Env](/docs/env/env.png)

## Desarrollo ⚙️

_Las siguientes instrucciones serviran para ejecutar en su entorno local la pruebas unitarias realizadas para el proyecto_

### Unit-Test

_Para ejecutar todos los Unit Test desarrollados en Jest y reporte de cobertura de codigo ejecutar el comando_

```
 npm run test:cov
```

_La carpeta con la cobertura del codigo se creara en la raiz del proyecto con la siguiente ruta coverage/Icov-report/index.html el cual se puede visualizar_

![Unit Test Coverage](/docs/unit-test/unit-test-coverage.png)

### Build

_Para generar el build de producción del proyecto ejecutar el siguiente comando:_

```
 npm run build
```

## Despliegue 👨🏻‍💻

_Para desplegar el proyecto mediante Docker se tiene los archivos ```Dockerfile``` y ```docker-compose.prod.yaml```, los cuales tienen preconfigurado la imagen y dependencias necesarias para levantar el proyecto_

_Para construir la imagen y ejecutarla tenemos el siguiente comando , el cual tambien tomara nuestras variable de entorno del archivo ```env```_

_Ejecutar el siguiente comando en la raiz del proyecto_

```
 docker-compose -f docker-compose.prod.yaml --env-file .env up --build
```

![Docker 1](/docs/docker/docker-1.png)

![Docker 2](/docs/docker/docker-2.png)

_En caso de requerir volver a ejecutar el contenedor del proyecto previamente creado ejecutar el comando:_

```
 docker-compose -f docker-compose.prod.yaml --env-file .env up
```

## Analisis de Codigo 🔩

_**Pre requisitos**_

_En la raiz del proyecto se tiene el archivo *sonar-project.properties* el cual tiene las propiedades necesarias para ejecutarlo sobre un SonarQube_

_Configurar los apartados : *sonar.host.url* , *sonar.login* *sonar.password* con los datos de su instancia correspondiente o usar SonarCloud con su token correspondiente_

```
Sonaqube >= 9.X
```

![SonarQube Properties](/docs/sonar/sonar-properties.png)

_Las pruebas fueron realizas sobre *SonarQube 9.5* y *SonarCloud* para ejecutar el analisis de codigo ejecutar el comando para la instancia local:_

```
npm run sonar
```

_Reporte de Cobertura en SonarCloud_

![SonarQube Cloud 1](/docs/sonar/sonar-cloud.png)

![SonarQube Cloud 2](/docs/sonar/sonar-cloud-2.png)

![SonarQube Cloud 3](/docs/sonar/sonar-cloud-3.png)

## Integración Continua

_Se realizo un CI con SonarCloud para ejecuta de manera automatica los test_

_Se creo la carpeta `.github/workflows` con el archivo `build.yml` que contiene los pasos para desplegar mediante GitHub Actions nuestro CI_

![CI 1](/docs/ci/ci-1.png)


## Documentacion

_Se realizo la documentación del API Rest usando Swagger el cual puede encontrar en la ruta http://localhost:3000/docs/  en la configuración por default_


![Swagger 1](/docs/swagger/swagger-1.jpg)

![Swagger 2](/docs/swagger/swagger-2.jpg)

## Logger

_Se integro winston para reemplazar el logger de NestJS para realizar seguimiento y conservacion de los logs segun sea requerido_

_En el archivo `.env` se tienen los siguientes apartados configurados por default:_

```
APP_NAME=SKY_KRONO
DATE_PATTERN=YYYY-MM-DD
MAX_SIZE=20m
MAX_DAYS=14d
```
_Por default la carpeta donde se guardan los logs es `LOG` , el formato configurado es JSON_

![LOGGER 1](/docs/logger/logger-1.png)

![LOGGER 2](/docs/logger/logger-2.png)

## Construido con 🛠️

_Las herramientas utilizadas son:_

- [NestJS](https://nestjs.com/) - El framework para construir aplicaciones del lado del servidor eficientes, confiables y escalables.
- [NPM](https://www.npmjs.com/) - Manejador de dependencias
- [Jest](https://jestjs.io/) - Framework Testing para pruebas unitarias
- [Docker](https://www.docker.com/) - Para el despliegue de aplicaciones basado en contenedores
- [SonarQube](https://www.sonarqube.org/) - Evaluacion de codigo on premise
- [SonarCloud](https://sonarcloud.io/) - Evaluacion de codigo cloud
- [Visual Studio Code](https://code.visualstudio.com/) - Editor de Codigo
- [Prettier](https://prettier.io/) - Formateador de Codigo
- [WebAuthn](https://webauthn.guide/) - Estándar web del proyecto FIDO2 de la Alianza FIDO
- [TabNine](https://www.tabnine.com/) - Autocompletador de Codigo
- [Swagger](https://swagger.io/) - Automatización de Documentación
- [Winston](https://github.com/winstonjs/winston) - Logger para NodeJS

## Versionado 📌

Usamos [GIT](https://git-scm.com/) para el versionado.

## Autor ✒️

- **Jaime Burgos Tejada** - _Developer_ - [SkyZeroZx](https://github.com/SkyZeroZx) - email : jaimeburgostejada@gmail.com
