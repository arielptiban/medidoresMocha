const conexion = require('../database/db')
const { verificarCedula } = require('udv-ec');
const { verificarRuc } = require('udv-ec')
const { default: Swal } = require('sweetalert2');
const pdf = require ('pdfkit-construct');


//NUEVO CLIENTE
exports.nuevo = async (req, res)=>{
    
    try {
        const cedula = req.body.cedula
        const nombres = req.body.nombres
        const apellidos = req.body.apellidos
        const telefono = req.body.telefono
        const direccion = req.body.direccion
        const f_ingreso = new Date()
        const f_actualizacion = new Date()
        const estado ="Habilitado"
    

        //comprobar que la cedula no este ingresada en base de datos

        // //comprobar cedula


            if (!verificarCedula(cedula)) {
                if(!verificarRuc(cedula)){
                    res.render('nuevoCliente', {
                        cedula: '',
                        nombres: nombres,
                        apellidos: apellidos,
                        telefono: telefono,
                        direccion: direccion,
                        alert: true,
                        alertSalir: false,
                        alertTitle: 'error',
                        alertMessage: 'La cedula o ruc es incorrecto',
                        alertIcon: 'info',
                        showConfirmButton: true,
                        timer: false,
                        ruta: ''
                    })
                }
                else {
                    conexion.query('SELECT cedula from clientes where ?', {
                        cedula: cedula
                    }, (error, rows) => {
                        if (error) {
                            console.log(error)
                        }
                        if (rows.length > 0) {
                            res.render('nuevoCliente', {
                                cedula: '',
                                nombres: nombres,
                                apellidos: apellidos,
                                telefono: telefono,
                                direccion: direccion,
                                alert: true,
                                alertSalir: false,
                                alertTitle: 'info',
                                alertMessage: 'Existe un cliente registrado con la misma cedula/ruc',
                                alertIcon: 'info',
                                showConfirmButton: true,
                                timer: false,
                                ruta: '/clientes'
                            })
                        } else {
                            conexion.query('INSERT INTO clientes SET ?', {
                                cedula: cedula,
                                nombres: nombres,
                                apellidos: apellidos,
                                telefono: telefono,
                                estado: estado,
                                direccion: direccion,
                                f_ingreso: f_ingreso.toLocaleDateString('zh-Hans-CN'),
                                f_actualizacion: f_actualizacion.toLocaleDateString('zh-Hans-CN')
                            }, (error, results) => {
                                if (error) {
                                    console.log(error)
                                }
                                res.render('nuevoCliente', {
                                    cedula: '',
                                    nombres: '',
                                    apellidos: '',
                                    telefono: '',
                                    direccion: '',
                                    alert: false,
                                    alertSalir: true,
                                    alertTitle: 'Success',
                                    alertMessage: 'Usuario creado correctamente',
                                    alertIcon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    ruta: '/clientes'
                                })
                            })
                        }
                    })
                }

            } 
            else {
                conexion.query('SELECT cedula from clientes where ?', {
                    cedula: cedula
                }, (error, rows) => {
                    if (error) {
                        console.log(error)
                    }
                    if (rows.length > 0) {
                        res.render('nuevoCliente', {
                            cedula: '',
                            nombres: nombres,
                            apellidos: apellidos,
                            telefono: telefono,
                            direccion: direccion,
                            alert: true,
                            alertSalir: false,
                            alertTitle: 'info',
                            alertMessage: 'Existe un cliente registrado con la misma cedula/ruc',
                            alertIcon: 'info',
                            showConfirmButton: true,
                            timer: false,
                            ruta: ''
                        })
                    } else {
                        conexion.query('INSERT INTO clientes SET ?', {
                            cedula: cedula,
                            nombres: nombres,
                            apellidos: apellidos,
                            telefono: telefono,
                            estado: estado,
                            direccion: direccion,
                            f_ingreso: f_ingreso.toLocaleDateString('zh-Hans-CN'),
                            f_actualizacion: f_actualizacion.toLocaleDateString('zh-Hans-CN')
                        }, (error, results) => {
                            if (error) {
                                console.log(error)
                            }
                            res.render('nuevoCliente', {
                                cedula: '',
                                nombres: '',
                                apellidos: '',
                                telefono: '',
                                direccion: '',
                                alert: false,
                                alertSalir: true,
                                alertTitle: 'Success',
                                alertMessage: 'Usuario creado correctamente',
                                alertIcon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                ruta: '/clientes'
                            })
                        })
                    }
                })
            }
       
        // if(!verificarCedula(cedula)){
        //     res.render('nuevoCliente',{
        //         cedula: '', nombres: nombres, apellidos: apellidos, telefono: telefono, direccion:direccion,
        //         alert: true,
        //         alertSalir:false,
        //         alertTitle: 'error',
        //         alertMessage: 'La cedula o ruc es incorrecto',
        //         alertIcon: 'info',
        //         showConfirmButton: true,
        //         timer: false,
        //         ruta: ''
        //     })
        //  }
        //  else{
        //     conexion.query('SELECT cedula from clientes where ?',{cedula: cedula}, (error, rows)=>{
        //         if(error){console.log(error)}
        //         if(rows.length > 0){
        //             res.render('nuevoCliente',{
        //                 cedula: '', nombres: '', apellidos: '', telefono: '', direccion:'',
        //                 alert: false,
        //                 alertSalir: true,
        //                 alertTitle: 'info',
        //                 alertMessage: 'El cliente ya está registrado',
        //                 alertIcon: 'info',
        //                 showConfirmButton: true,
        //                 timer: false,
        //                 ruta: '/clientes'
        //             })
        //         }
        //         else{
        //             conexion.query('INSERT INTO clientes SET ?', {
        //                 cedula: cedula, 
        //                 nombres: nombres,
        //                 apellidos: apellidos,
        //                 telefono: telefono,
        //                 estado: estado,
        //                 direccion: direccion,
        //                 f_ingreso: f_ingreso.toLocaleDateString('zh-Hans-CN'),
        //                 f_actualizacion: f_actualizacion.toLocaleDateString('zh-Hans-CN')
        //             }, (error, results)=>{
        //                 if(error){console.log(error)}
        //                 res.render('nuevoCliente',{
        //                     cedula: '', nombres: '', apellidos: '', telefono: '', direccion:'',
        //                     alert: false,
        //                     alertSalir: true,
        //                     alertTitle: 'Success',
        //                     alertMessage: 'Usuario creado correctamente',
        //                     alertIcon: 'success',
        //                     showConfirmButton: false,
        //                     timer: 1500,
        //                     ruta: '/clientes'
        //                 })
        //             })
        //         }
        //     })
        //  }


    } catch (error) {
        console.log(error)
    }

}
//EDITAR CLIENTE
exports.editar = (req, res)=>{

    try {
        const id = req.body.id
        const cedula = req.body.cedula
        const nombres = req.body.nombres
        const apellidos = req.body.apellidos
        const direccion = req.body.direccion
        const telefono = req.body.telefono
        const f_actualizacion = new Date()
        const estado ="Habilitado"

        if(!cedula || !nombres || !apellidos || !telefono){
            res.render(  'nuevoCliente' ,{
                cedula: '', nombres: nombres, apellidos: apellidos, telefono: telefono, direccion:direccion,alertSalir: true,
                alert: true,
                alertTitle: 'error',
                alertMessage: 'Completar los campos requeridos',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/editarCliente/' + id
            })
        }else{
            conexion.query('UPDATE clientes SET ? WHERE id = ?', [{
                cedula: cedula,
                nombres: nombres, 
                apellidos: apellidos, 
                telefono:telefono,
                direccion: direccion, 
                f_actualizacion: f_actualizacion.toLocaleDateString('zh-Hans-CN'),
                estado: estado}, id ],
                (error, results)=>{
                    if(error){console.log(error)}
                    else{
                        res.render('nuevoCliente',{
                        alert: true,cedula: '', nombres: nombres, apellidos: apellidos, telefono: telefono, direccion:direccion, alertSalir: true,
                        alertTitle: 'Success',
                        alertMessage: 'Cliente actualizado correctamente',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: '/clientes'
                    })}
            })
        }

        
    } catch (error) {
        
    }
}
exports.estado = (req, res)=>{
    const id = req.body.id
    const estado = req.body.estado

    if(estado == "Habilitado"){
        console.log('si')
    }

    // conexion.query('UPDATE clientes SET ? WHERE id = ?', [{
    //     cedula: cedula, 
    //     nombres: nombres, 
    //     apellidos: apellidos, 
    //     telefono:telefono,
    //     direccion: direccion, 
    //     f_actualizacion: f_actualizacion.toLocaleDateString('zh-Hans-CN'),
    //     estado: estado}, id ],
    //     (error, results)=>{
    //         if(error){console.log(error)}
    //         else{
    //             res.render('nuevoUsuario',{
    //             alert: true,
    //             alertTitle: 'Success',
    //             alertMessage: 'Cliente actualizado correctamente',
    //             alertIcon: 'success',
    //             showConfirmButton: false,
    //             timer: 1500,
    //             ruta: '/clientes'
    //         })}
    // })

}
exports.reporte = (req, res)=>{

    const doc = new pdf({bufferPage: true})
    const fecha = new Date()
    const filename = `reporteClientes${Date.now()}.pdf`
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
        .fontSize(10).text('Reporte de Clientes', 200, 65, {align: 'right'})
        .fontSize(10).text('Fecha: ' + fecha.toLocaleDateString('zh-Hans-CN') , 200, 80, {align: 'right'})
        .moveDown();
    })

    const datos = conexion.query('select cedula , CONCAT(nombres, " ", apellidos)as nombres, telefono, estado, date_format(f_ingreso, "%d-%m-%Y") as f_ingreso, date_format(f_actualizacion, "%d-%m-%Y") as f_actualizacion from clientes', (error, results)=>{

        if(error){console.log(error)}
    doc.addTable([
        {key: 'cedula', label: 'Cedula', align:'center'},
        {key: 'nombres', label: 'Nombres', align:'center'},
        {key: 'telefono', label: 'Telefono', align:'center'},
        {key: 'estado', label: 'Estado', align:'center'},
        {key: 'f_ingreso', label: 'Creado en', align:'center'},
        {key: 'f_actualizacion', label: 'Ult. Modificación', align:'center'},

    ], results ,{
        border:  {size: 0.1, color: '#cdcdcd'},
        headAlign : 'center',
        width: "fit-content",
        striped: false,
        stripedColors: ["", ""],
        cellsPadding: 10,
        marginLeft: 45,
        marginRight: 45,
        cellsPadding : 5,
        cellsMaxWidth : 120,
        cellsFontSize : 9,
        cellsFont : "Helvetica",
    })
    doc.render()
    doc.end()
    })
}
