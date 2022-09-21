const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts')


const app = express();

//plantillas

app.set('view engine', 'ejs');



// set carpeta public archivos estaticos
app.use(express.static('public'))

//proceso de datos enviados desde formularios
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//variables de entorno
dotenv.config({path: './env/.env'})

//cookies
app.use(cookieParser())

//eliminar cache COOKIE
// var app = express()
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

//llamar al router
app.use('/', require('./routes/router'))

app.listen(3000, ()=>{
    console.log('El servidor está corriendo en el puerto 3000')
})