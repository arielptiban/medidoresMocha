const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')
const nodemailer = require('nodemailer')

//LOG IN
exports.login = async (req, res)=>{
    try {
        const correo = req.body.correo
        const contraseña = req.body.contraseña
        
        if(!correo || !contraseña ){
            res.render('login',{
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'Ingrese un correo y una contraseña',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: '/login'
            })
        }
        else{
            conexion.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async(error, results)=>{
                if(error){console.log(error)}
                if(results.length == 0 || !(await bcryptjs.compare(contraseña, results[0].contraseña)) ){
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Advertencia',
                        alertMessage: 'Correo y/o contraseña incorrectas',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: '/login'
                    })
                }
                else{
                    //inicio valido
                    if(results[0].estado ==="Activo"){

                        const id = results[0].id
                        const correo = results[0].correo
                        const token = jwt.sign( {id:id}, process.env.JWT_SECRETO , {expiresIn: process.env.JWT_TIEMPO_EXPIRA,})
     
     
                        const cookieOpts = {
                         expires: new Date( Date.now()+process.env.JWT_COOKIE_EXPIRES *24 *60 *60 *1000 ),
                         httpOnly: true
                        }
     
                        res.cookie('jwt', token, cookieOpts)
                        res.cookie('id', id)
                        res.render('login',{
                         alert: true,
                         alertTitle: 'Inicio de sesión correcto',
                         alertMessage: 'Bienvenido',
                         alertIcon: 'success',
                         showConfirmButton: false,
                         timer: 800,
                         ruta: '/'
                    })

                    }else{
                        res.render('login',{
                            alert: true,
                            alertTitle: 'Advertencia',
                            alertMessage: 'Error al iniciar sesión, por favor comuníquese con el Administrador',
                            alertIcon: 'error',
                            showConfirmButton: true,
                            timer: false,
                            ruta: '/login'
                        })
                    }

            }
            })
        }
    } catch (error) {
        console.log(error)
    }
}
//Comprobar que el usuario esté autenticado
exports.autenticado = async (req, res, next)=>{

    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM usuarios WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.usuario = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')
    }

}
//cerrar sesion
exports.logout = (req, res)=>{
    res.clearCookie('jwt')
    res.clearCookie('id')
    return res.redirect('/')
}
//RECUPERAR CONTRASEÑA
exports.recuperar = async (req, res)=>{

    try {
        const correo = req.body.correo
        if(!correo){
            res.render('recuperarPass',{
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'Ingrese un correo',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: '/recuperarPass'
            })
        }
        else{
            conexion.query('Select id, nombres, apellidos,contraseña from usuarios where correo = ?', [correo], (error, results)=>{
                if(error){console.log(error)}
                if(results.length > 0){
                    let id = results[0].id
                    //GENERO NUEVA CONTRASEÑA
                    const base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.?,;-_!¡¿*%&$/()[]{}|@<>"
                    let length = 12
                    const nuevaPass = generarPassword(base, length)
                    //ENVIO DE EMIAL
                    let transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true, // true for 465, false for other ports
                        auth: {
                            user: 'mochamedidores@gmail.com', // generated ethereal user
                            pass: 'anvjgfkmxgeroyhb', // generated ethereal password
                        },
                    });
                    let info = transporter.sendMail({
                        from: '"Recuperar Contraseña ⚙" <mochamedidores@gmail.com>', // sender address
                        to: correo, // list of receivers
                        subject: "Recuperar contraseña ✔", // Subject line
                        html: "<b>Hola, </b>" + results[0].nombres + ' ' +results[0].apellidos+ "<b>:</b> <br>"
                        +"<p>Recibimos una solicitud para restablecer tu contraseña.</p>" 
                        +"<p>Tu nueva contraseña es:</p> "
                        +"<p>Recuerda cambiar tu contraseña</p>"// html body
                    });
                    //ENCRIPTO CONTRASEÑA
                    const encriptada = bcryptjs.hashSync(nuevaPass, 8)
                    //ACTUALIZO CONTRASEÑA
                    conexion.query('UPDATE usuarios SET ? WHERE id = ?', [{
                        contraseña: encriptada}, id ],
                        (error, results)=>{
                            if(error){console.log(error)}
                            else{

                                res.render('recuperarPass',{
                                    alert: true,
                                    alertTitle: 'Success',
                                    alertMessage: 'Revisa tu correo electrónico para recuperar tu contraseña',
                                    alertIcon: 'success',
                                    showConfirmButton: true,
                                    ruta: '/login'
                                })
                                
                            }
                    })
                    
                }
                else{
                    res.render('recuperarPass',{
                        alert: true,
                        alertTitle: 'No hay resultados de búsqueda',
                        alertMessage: 'Tu búsqueda no ha devuelto ningún resultado. Vuelve a intentarlo con otra información.',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: '/recuperarPass'
                    })
                }
            })


        }
    } catch (error) {
        
    }
}
//FENERAR CONTRASEÑA ALEATORIA
const generarPassword = (base,length)=>{
    let password = ""
    for (let x = 0; x < length; x++) {
       password += base.charAt(Math.floor(Math.random() * base.length ))
    }
    return password
}