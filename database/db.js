//conexion base de datos
const mysql = require('mysql')

//CONEXION
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})

conexion.connect( (error)=>{
    if(error){
        console.log('El error de conexion es: ', error);
        return
    }
    console.log('Conexion exitosa')
})

module.exports = conexion