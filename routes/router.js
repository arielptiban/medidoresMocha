const { Router } = require('express')
const express = require('express')
const router = express.Router()

const conexion = require('../database/db')
const authController = require('../controllers/authController')
const usuariosController = require('../controllers/usuariosController')
const clientesController = require('../controllers/clientesController')
const medidoresController = require('../controllers/medidoresController')
const lecturasController = require('../controllers/lecturasController')
const Swal = require('sweetalert2')

//RUTAS INTERFACES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOGIN
router.get('/login', (req, res)=>{
    res.render("login", { alert: false })
})
// VERIFICAR SI ESTÁ AUTENTICADO EN LA APP
router.get('/', authController.autenticado, (req, res)=>{
    res.render("index", {usuario: req.usuario})
})
//  RECUPERAR CONTRASEÑA
router.get('/recuperarPass', (req, res)=>{
    res.render('recuperarPass', {alert: false})
})
//MI PERFIL
router.get('/editarPerfil',authController.autenticado, (req, res)=>{
    const id = req.cookies.id
    conexion.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('editarPerfil',{usuario: results[0] , alert:false})
        }
    })
})
//MI Cambiar contraseña
router.get('/cambiarPass', authController.autenticado, (req, res)=>{
    const id = req.cookies.id
    conexion.query('SELECT id, contraseña FROM usuarios WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('cambiarPass',{usuario: results[0] , alert:false, passA: ''})
        }
    })
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//USUARIOS
//NUEVO USUARIO
router.get('/nuevoUsuario',authController.autenticado, (req, res)=>{
    res.render("nuevoUsuario",{ alert: false,  alertSalir: false, cedula: '', nombres: '', apellidos: '', telefono: '', correo:'', contrasena:''  })
})
//EDITAR USUARIO
router.get('/editarUsuario/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id;
    conexion.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('editarUsuario',{usuario: results[0] , alert:false, alertSalir: false, cedula: '', nombres: '', apellidos: '', telefono: '', correo:'', contrasena:''})
        }
    })
})
//LLENAR TABLA DE USUARIOS  
router.get('/usuarios', authController.autenticado,(req, res)=>{
    conexion.query('SELECT * FROM usuarios', (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('usuarios',{results: results})
        }
       })
})
//ELIMINAR USUARIO
// router.get('/eliminarUsuario/:id', authController.autenticado, (req, res)=>{
//     const id = req.params.id;
//     conexion.query('DELETE FROM usuarios WHERE id = ?', [id], (error, results)=>{
//         if(error){console.log(error)}
//         else{
//             res.redirect('/usuarios')
//         }
//     })
// })
router.get('/editarEstadoU/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id;
    conexion.query('SELECT estado FROM usuarios WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            const valor = JSON.parse (JSON.stringify(results[0]))
            if(valor.estado === 'Activo'){
                conexion.query('UPDATE usuarios SET estado = "Suspendido" WHERE id= ?', [id], (error, results)=>{
                    if(error){console.log(error)}
                    else{
                        res.redirect('/usuarios')
                    }
                })
            }else{
                conexion.query('UPDATE usuarios SET estado = "Activo" WHERE id= ?', [id], (error, results)=>{
                    if(error){console.log(error)}
                    else{
                        res.redirect('/usuarios')
                    }
                })
            }
        }
    })
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NUEVO CLIENTE
router.get('/nuevoCliente', authController.autenticado, (req, res)=>{
    res.render("nuevoCliente", { alert: false, alertSalir: false, cedula: '', nombres: '', apellidos: '', telefono: '', direccion:'' })
})
//LLENAR TABLA DE CLIENTES  
router.get('/clientes', authController.autenticado,(req, res)=>{
    conexion.query('select id, cedula, nombres, apellidos, direccion, telefono, estado, date_format(f_actualizacion, "%d-%m-%Y") as f_actualizacion from apiweb.clientes', (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('clientes',{results: results})
        }
    })
})
//EDITAR CLIENTES
router.get('/editarCliente/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id;
    conexion.query('SELECT * FROM clientes WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('editarCliente',{cliente: results[0] , alert:false, alertSalir: false, cedula: '', nombres: '', apellidos: '', telefono: '', direccion:''})
        }
    })
})
//EDITAR ESTADO
router.get('/editarEstado/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id;
    conexion.query('SELECT estado FROM clientes WHERE id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            //console.log(JSON.stringify(results[0]))
            const valor = JSON.parse (JSON.stringify(results[0]))
            if(valor.estado === 'Habilitado'){
                conexion.query('UPDATE clientes SET estado = "Suspendido" WHERE id= ?', [id], (error, results)=>{
                    if(error){console.log(error)}
                    else{

                        conexion.query('UPDATE medidores SET estado = "Suspendido" WHERE id_cliente =?', [id], (error, results)=>{
                            if(error){console.log(error)}
                            else{
                                res.redirect('/clientes')
                            }
                        })
                    }
                })
            }else{
                conexion.query('UPDATE clientes SET estado = "Habilitado" WHERE id= ?', [id], (error, results)=>{
                    if(error){console.log(error)}
                    else{
                        res.redirect('/clientes')
                    }
                })
            }
        }
    })
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LISTA MEDIDORES
router.get('/medidores', authController.autenticado, (req, res)=>{
    conexion.query('select m.id, cod_Medidor, cuenta, nombres, apellidos, m.estado, m.estado_lectura from medidores m inner join clientes c on m.id_cliente = c.id', (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('medidores',{results: results})
        }
    })
})
//NUEVO MEDIDORES
router.get('/nuevoMedidor',authController.autenticado, (req, res)=>{
    res.render("nuevoMedidor", {alert: false, alertSalir: false, codigo: '', cuenta: '', ingreso: ''})
    
})
//EDITAR ESTADO MEDIDOR
router.get('/editarEstadoM/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id;

    conexion.query('SELECT m.id, cod_Medidor, m.estado, c.estado as clienteE from medidores m inner join clientes c on m.id_cliente = c.id WHERE m.id= ?', [id], (error, results)=>{
        if(error){console.log(error)}
        //  const estadoCliente = JSON.stringify(results[0].estadoCliente)
        //  const estadoMedidor = JSON.stringify(results[0].estado)

        //  const valCli = JSON.parse(estadoCliente)
        //  const valMed = JSON.parse(estadoMedidor)
        console.log(results[0].clienteE)

        if(results[0].clienteE === 'Habilitado' && results[0].estado === 'Suspendido'){
            conexion.query('UPDATE medidores SET estado = "Habilitado" WHERE id= ? ', [id], (error, results)=>{
                if(error){console.log(error)}
                else{
                    res.redirect('/medidores')
                }
            })
        }
        if(results[0].clienteE === 'Suspendido'){
            res.redirect('/medidores?updateEstado=false')
        }
        if(results[0].clienteE === 'Habilitado' && results[0].estado === 'Habilitado'){
            conexion.query('UPDATE medidores SET estado = "Suspendido" WHERE id= ? ', [id], (error, results)=>{
                if(error){console.log}
                else{
                    res.redirect('/medidores')
                }
            })
        }
    })
})

router.get('/habilitarLectura', authController.autenticado, (req, res)=>{
    conexion.query('UPDATE medidores SET estado_lectura = "Pendiente" WHERE estado_lectura = "Leído" && estado = "Habilitado" ', (error, results)=>{
        if(error){console.log(error)}
        else{
            res.redirect('/medidores')
        }
    })
})

router.get('/editarMedidores/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id
    conexion.query('SELECT m.id, cod_Medidor, ubicacion, nombres, apellidos FROM medidores m inner join clientes c on m.id_cliente = c.id WHERE m.id = ?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('editarMedidores',{medidor: results[0] , alert:false, })
        }
    })
})

router.get('/medidores/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id
    conexion.query('select m.id, cod_Medidor, cuenta, m.estado,estado_lectura, c.nombres, c.apellidos from medidores m inner join clientes c on m.id_cliente = c.id where c.id =?',[id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('medidores',{results: results})
        }
    })
})

//LECTURAS
router.get('/lecturas', authController.autenticado, (req, res)=>{
    res.render('lecturas',{results: '', fecha: 'today'})
})

router.get('/lecturaUSU/:id', authController.autenticado, (req, res)=>{
    const id = req.params.id
    conexion.query('select cod_Medidor, nombres, apellidos,lectura_anterior, lectura_actual, consumo, observacion, date_format(fecha, "%d-%m-%Y") as fecha from lecturas l inner join medidores m on l.id_medidor = m.id inner join clientes c on m.id_cliente = c.id where l.id_medidor =?', [id], (error, results)=>{
        if(error){console.log(error)}
        else{
            res.render('lecturaUSU' ,{results: results, fecha: ''})
        }
    })
    // res.render('lecturaUSU',{results: '', fecha: '', id: id})
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RUTAS CONTROLLER
//RUTAS LOGIN - LOGOUT
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/recPass', authController.recuperar)
router.post('/editarPerfil', usuariosController.editarPerfil)
router.post('/cambiarPass', usuariosController.cambiarPass)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CRUD USUARIOS CONTROLLERS
router.post('/nuevoUsuario', usuariosController.nuevo)
router.post('/editarUsuario', usuariosController.editar)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CRUD CLIENTES CONTROLLERS
router.post('/nuevoCliente', clientesController.nuevo)
router.post('/editarCliente', clientesController.editar)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CRUD CLIENTES CONTROLLERS
router.post('/nuevoMedidor', medidoresController.nuevo)
router.post('/editarMedidor', medidoresController.editar)
router.get('/reporteUsuarios', usuariosController.reporte)
router.get('/reporteClientes', clientesController.reporte)
router.get('/reporteMedidores', medidoresController.reporte)

router.post('/lecturas', lecturasController.buscar)
router.get('/reporteLecturas', lecturasController.reporte)

// router.get('/cambiarLectura', medidoresController.cambiar)
module.exports = router