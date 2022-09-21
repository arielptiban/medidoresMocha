const bcryptjs = require('bcryptjs');
const { default: Swal } = require('sweetalert2');
const { verificarCedula } = require('udv-ec');
const conexion = require('../database/db')
const validarEmail = require("email-validator")
const pdf = require ('pdfkit-construct');
//CRUD USUARIOS

//NUEVO USUARIO
exports.nuevo = async (req, res)=>{
    
    try {
        const cedula = req.body.cedula
        const nombres = req.body.nombres
        const apellidos = req.body.apellidos
        const telefono = req.body.telefono
        const correo = req.body.correo
        const contraseña = req.body.contraseña
        const estado = "Activo"
        //COMPROBAR EL FORMATO DE LA CONTRASEÑA

        if(!soloLetras(nombres)){
            res.render(  'nuevoUsuario' ,{
                alert: true,
                alertTitle: 'error',
                alertMessage: 'El campo solo acepta letras',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/nuevoUsuario'
            })
        }
        if(!soloLetras(apellidos)){
            res.render(  'nuevoUsuario' ,{
                alert: true,
                alertTitle: 'error',
                alertMessage: 'El campo solo acepta letras',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/nuevoUsuario'
            })
        }
        //Encriptar contraseña
        let encriptada = await bcryptjs.hash(contraseña,8)

        //comprobar que la cedula no este ingresada en base de datos
        // //comprobar cedula
        if(!verificarCedula(cedula)){
            res.render('nuevoUsuario',{
                alertSalir: false, cedula: '', nombres: nombres, apellidos: apellidos, telefono: telefono, correo: correo, contrasena: contraseña,
                alert: true,
                alertTitle: 'error',
                alertMessage: 'La cedula es incorrecta',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
            })
         }
         else if(!comprobarPass(contraseña)){
            res.render(  'nuevoUsuario' ,{
                alertSalir: false, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:correo, contrasena:'',
                alert: true,
                alertTitle: 'error',
                alertMessage: 'La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula y un número',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false
            })
        }
         else{
            conexion.query('SELECT cedula from usuarios where ?',{cedula: cedula}, (error, rows)=>{
                if(error){console.log(error)}
                if(rows.length > 0){
                    res.render('nuevoUsuario',{
                        alertSalir: false, cedula: '', nombres: nombres, apellidos: apellidos, telefono: telefono, correo: correo, contrasena: contraseña,
                        alert: true,
                        alertTitle: 'info',
                        alertMessage: 'La cedula pertenece a un usuario registrado',
                        alertIcon: 'info',
                        showConfirmButton: true,
                        timer: false,
                    })
                }
                else{
                    conexion.query('SELECT correo from usuarios where ?',{correo: correo}, (error, rows)=>{
                        if(error){console.log(error)}
                        if(rows.length > 0){
                            res.render('nuevoUsuario',{
                                alertSalir: false, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo: '', contrasena: contraseña,
                                alert: true,
                                alertTitle: 'Advertencia',
                                alertMessage: 'Existe un usuario registrado con el mismo correo electrónico',
                                alertIcon: 'info',
                                showConfirmButton: true,
                                timer: false
                            })
                        }
                        else{
                            conexion.query('INSERT INTO usuarios SET ?', {
                                cedula: cedula, 
                                nombres: nombres,
                                apellidos: apellidos,
                                telefono: telefono,
                                correo: correo,
                                contraseña: encriptada,
                                estado: estado
                            }, (error, results)=>{
                                if(error){console.log(error)}
                                res.render('nuevoUsuario',{
                                    alertSalir: true, cedula: '', nombres: '', apellidos: '', telefono: '', correo: '', contrasena: '',
                                    alert: false,
                                    alertTitle: 'Success',
                                    alertMessage: 'Usuario creado correctamente',
                                    alertIcon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    ruta: '/usuarios'
                                })
                            })
                        }
                    })
                }
            })
         }

    } catch (error) {
        console.log(error)
    }

}
//EDITAR USUARO
exports.editar = (req, res)=>{

    try {
        const id = req.body.id
        const cedula = req.body.cedula
        const nombres = req.body.nombres
        const apellidos = req.body.apellidos
        const telefono = req.body.telefono
        const correo = req.body.correo    
        
        const correoV = req.body.correoV    

        if(!cedula || !nombres || !apellidos || !telefono || !correo){
            res.render(  'nuevoUsuario' ,{
                alertSalir: false, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:correo, contrasena :'',
                alert: true,
                alertTitle: 'error',
                alertMessage: 'Completar los campos requeridos',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/editarUsuario/' + id
            })
        }else{

            if(!validarEmail.validate(correo)){
                res.render(  'nuevoUsuario' ,{
                    alertSalir: false, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:correo, contrasena :'',
                    alert: true,
                    alertTitle: 'error',
                    alertMessage: 'Email no valido',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/editarUsuario/' + id
                })
            }
            else{
                if( correoV !== correo ){
                    conexion.query('SELECT correo from usuarios where ?',{correo: correo}, (error, rows)=>{
                        if(error){console.log(error)}
                        if(rows.length > 0){
                            res.render('nuevoUsuario',{
                            alertSalir: true, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:'', contrasena :'',
                            alert: false,
                            alertTitle: 'info',
                            alertMessage: 'El correo ingresado pertenece a otro usuario',
                            alertIcon: 'info',
                            showConfirmButton: true,
                            timer: false,
                            ruta: '/editarUsuario/' + id
                        })
                    } else{
                        conexion.query('UPDATE usuarios SET ? WHERE id = ?', [
                            {cedula: cedula, nombres: nombres, apellidos: apellidos, telefono:telefono, correo: correo}, id ],
                            (error, results)=>{
                                if(error){console.log(error)}
                                else{
                                    res.render('nuevoUsuario',{
                                        alertSalir: true, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:correo, contrasena :'',
                                        alert: false,
                                        alertTitle: 'Success',
                                        alertMessage: 'Usuario modificado correctamente',
                                        alertIcon: 'success',
                                        showConfirmButton: false,
                                        timer: 1500,
                                        ruta: '/usuarios'
                                    })
                                }
                            })
                    }})
                }else{
                    conexion.query('UPDATE usuarios SET ? WHERE id = ?', [
                        {cedula: cedula, nombres: nombres, apellidos: apellidos, telefono:telefono, correo: correo}, id ],
                        (error, results)=>{
                            if(error){console.log(error)}
                            else{
                                res.render('nuevoUsuario',{
                                    alertSalir: true, cedula: cedula, nombres: nombres, apellidos: apellidos, telefono: telefono, correo:correo, contrasena :'',
                                    alert: false,
                                    alertTitle: 'Success',
                                    alertMessage: 'Usuario modificado correctamente',
                                    alertIcon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    ruta: '/usuarios'
                                })
                            }
                        })
                }
                
            }
        }
    } catch (error) {
        
    }
}
//GENERAR REPORTES
exports.reporte = (req, res)=>{
    const doc = new pdf({bufferPage: true})
    const fecha = new Date()
    const filename = `reporteUsuarios${Date.now()}.pdf`
    const stream = res.writeHead(200, {
        'Content-Type' : 'application/pdf',
        'Content-disposition' : 'attachment; filename='+filename
    })


    doc.on('data', (data)=>{stream.write(data)})
    doc.on('end', ()=>{stream.end()})

    doc.setDocumentHeader({
        height:'16'
    }, ()=>{
        doc.image('public/img/logo1.png', 50, 45, {width:50})
        .fontSize(20).text('GAD Municipal de Mocha', 100, 57)
        .fontSize(10).text('Reporte de Usuarios', 200, 65, {align: 'right'})
        .fontSize(10).text('Fecha: ' + fecha.toLocaleDateString('zh-Hans-CN') , 200, 80, {align: 'right'})
        .moveDown();
    })

    const datos = conexion.query('select cedula , CONCAT(nombres, " ", apellidos)as nombres, telefono, correo from usuarios', (error, results)=>{

        if(error){console.log(error)}
    doc.addTable([
        {key: 'cedula', label: 'Cedula', align:'center'},
        {key: 'nombres', label: 'Nombres', align:'center'},
        {key: 'telefono', label: 'Telefono', align:'center'},
        {key: 'correo', label: 'Correo', align:'center'}
    ], results ,{
        border:  {size: 0.1, color: '#cdcdcd'},
        headAlign : 'center',
        width: "fit-content",
        striped: false,
        stripedColors: ["", ""],
        cellsPadding: 10,
        marginLeft: 45,
        marginRight: 45,
        cellsPadding : 8,
        cellsMaxWidth : 120,
        cellsAlign : 'left' ,
        cellsFontSize : 12,
        cellsFont : "Helvetica",
    })
    doc.render()
    doc.end()
    })
}
//EDITAR PERFIL
exports.editarPerfil = (req, res)=>{

    try {
        const id = req.body.id
        const cedula = req.body.cedula
        const nombres = req.body.nombres
        const apellidos = req.body.apellidos
        const telefono = req.body.telefono
        const correo = req.body.correo    
        
        const correoV = req.body.correoV    

        if(!cedula || !nombres || !apellidos || !telefono || !correo){
            res.render(  'editarPefil' ,{
                alert: true,
                alertTitle: 'error',
                alertMessage: 'Completar los campos requeridos',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/editarPefil'
            })
        }else{

            if(!validarEmail.validate(correo)){
                res.render(  'editarPefil' ,{
                    alert: true,
                    alertTitle: 'error',
                    alertMessage: 'Email no valido',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: '/editarPefil'
                })
            }
            else{
                if( correoV !== correo ){
                    conexion.query('SELECT correo from usuarios where ?',{correo: correo}, (error, rows)=>{
                        if(error){console.log(error)}
                        if(rows.length > 0){
                            res.render('editarPefil',{
                            alert: true,
                            alertTitle: 'info',
                            alertMessage: 'El correo ingresado pertenece a otro usuario',
                            alertIcon: 'info',
                            showConfirmButton: true,
                            timer: false,
                            ruta: '/editarPefil'
                        })
                    } else{
                        conexion.query('UPDATE usuarios SET ? WHERE id = ?', [
                            {cedula: cedula, nombres: nombres, apellidos: apellidos, telefono:telefono, correo: correo}, id ],
                            (error, results)=>{
                                if(error){console.log(error)}
                                else{
                                    res.render('editarPefil',{
                                        alert: true,
                                        alertTitle: 'Success',
                                        alertMessage: 'Usuario modificado correctamente',
                                        alertIcon: 'success',
                                        showConfirmButton: false,
                                        timer: 1500,
                                        ruta: '/'
                                    })
                                }
                            })
                    }})
                }else{
                    conexion.query('UPDATE usuarios SET ? WHERE id = ?', [
                        {cedula: cedula, nombres: nombres, apellidos: apellidos, telefono:telefono, correo: correo}, id ],
                        (error, results)=>{
                            if(error){console.log(error)}
                            else{
                                res.render('editarPefil',{
                                    alert: true,
                                    alertTitle: 'Success',
                                    alertMessage: 'Usuario modificado correctamente',
                                    alertIcon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    ruta: '/'
                                })
                            }
                        })
                }
                
            }
        }
    } catch (error) {
        
    }
}
//CAMBIAR CONTRASEÑA
exports.cambiarPass = (req, res)=>{
    try {
        const id = req.cookies.id
        const aContraseña = req.body.aContraseña
        const nContraseña = req.body.nContraseña

        //CAMPOS VACIOS
        if(!nContraseña || !aContraseña){
            res.render(  'cambiarPass' ,{
                passA:aContraseña,
                alert: true,
                alertTitle: 'error',
                alertMessage: 'Completar los campos requeridos',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'cambiarPass'
            })
        }
        else{
            //COMPRUEBO EL FORMATO DE LA CONTRASEÑA NUEVA
            if(!comprobarPass(nContraseña)){
                res.render(  'cambiarPass' ,{
                    passA: aContraseña ,
                    alert: true,
                    alertTitle: 'error',
                    alertMessage: 'La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula y un número',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'cambiarPass'
                })
            }
            else{
            
                //COMPROBAR QUE LA CONTRASEÑA ANTIGUA COINCIDA
                conexion.query('SELECT contraseña from usuarios where id =?', [id], (error, results)=>{
                    if(error){console.log(error)}
                    if( !( bcryptjs.compareSync(aContraseña, results[0].contraseña)) ){
                        res.render('cambiarPass',{
                            passA:aContraseña,
                            alert: true,
                            alertTitle: 'Advertencia',
                            alertMessage: 'La contraseña antigua no es correcta',
                            alertIcon: 'error',
                            showConfirmButton: true,
                            timer: false,
                            ruta: 'cambiarPass'
                        })
                    }else{
                        const encriptada = bcryptjs.hashSync(nContraseña, 8)
                        conexion.query('UPDATE usuarios SET ? WHERE id =?',[{contraseña: encriptada}, id],(error, results)=>{
                            if(error){console.log(error)}
                            else{
                                res.clearCookie('jwt')
                                res.clearCookie('id')
                                res.render('cambiarPass',{
                                    passA:'',
                                    alert: true,
                                    alertTitle: 'Contraseña Actualizada',
                                    alertMessage: 'Vuelve a inicar sesión',
                                    alertIcon: 'success',
                                    showConfirmButton: true,
                                    timer: false,
                                    ruta: '/'
                                })
                            }
                        })
                    }
                })

            }
        }

    } catch (error) {
        console.log(error)
    }
}

function comprobarPass (nContraseña){
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(nContraseña)
}
function soloLetras (campo){
    return /[a-zA-Z ]{2,254}/.test(campo)
}