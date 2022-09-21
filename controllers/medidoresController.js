const conexion = require('../database/db')
const pdf = require('pdfkit-construct');

//NUEVO MEDIDOR
exports.nuevo = (req, res) => {

   try {
      const idCliente = req.body.idCliente
      const codMedidor = req.body.codigo
      const cuenta = req.body.cuenta
      const l_ingreso = req.body.l_ingreso
      const f_ingreso = new Date()
      const prop = req.body.propietario
      const estado = "Activo"
      const estado_lectura = "Leído"

      //  conexion.query('SELECT cod_Medidor from medidores where cod_Medidor= ?',[codMedidor], (error, rows)=>{
      //    if(error){console.log}
      //    if(rows.length > 0){
      //       res.render('nuevoMedidor',{
      //          alert: true,
      //          alertTitle: 'info',
      //          alertMessage: 'El código de medidor ya está registrado',
      //          alertIcon: 'info',
      //          showConfirmButton: true,
      //          timer: false,
      //          ruta: '/clientes'
      //      })
      //    }
      //    else{
      //       conexion.query('Select id_cliente from medidores where id_cliente= ?', [idCliente], (error, results)=>{
      //          if(error){console.log(error)}
      //          if(results.length >= 4 ){
      //             res.render('nuevoMedidor',{
      //                alert: true,
      //                alertTitle: 'info',
      //                alertMessage: 'El cliente ya tiene registrado 4 medidores',
      //                alertIcon: 'info',
      //                showConfirmButton: true,
      //                timer: false,
      //                ruta: '/clientes'
      //            })
      //          }else{
      //             conexion.query('INSERT INTO medidores SET ?',{
      //                id_cliente: idCliente,
      //                cod_Medidor: codMedidor,
      //                ubicacion: ubicacion,
      //                estado: estado
      //             }, (error, results)=>{
      //                if(error){console.log(error)}
      //                else{
      //                   res.redirect('/medidores')
      //                }
      //             })
      //          }
      //       } )
      //    }
      //  })

      conexion.query('SELECT cod_Medidor from medidores where cod_Medidor= ?', [codMedidor], (error, rows) => {
         if (error) {console.log}
         if (rows.length > 0) {
            res.render('nuevoMedidor', {
               alertSalir: true, codigo: '', cuenta: '', ingreso: '',
               alert: false,
               alertTitle: 'info',
               alertMessage: 'El código de medidor ya está registrado',
               alertIcon: 'info',
               showConfirmButton: true,
               timer: false,
               ruta: '/nuevoMedidor?cliente='+idCliente +"&prop=" + prop
            })

         } else {
            conexion.query('Select id_cliente from medidores where id_cliente= ?', [idCliente], (error, results) => {
               if (error) {
                  console.log(error)
               }
               if (results.length >= 4) {
                  res.render('nuevoMedidor', {
                     alertSalir: false, codigo: '', cuenta: '', ingreso: '',
                     alert: true,
                     alertTitle: 'info',
                     alertMessage: 'El cliente ya tiene registrado 4 medidores',
                     alertIcon: 'info',
                     showConfirmButton: true,
                     timer: false,
                     ruta: '/clientes'
                  })
               } else {
                  conexion.query("SELECT cuenta from medidores where cuenta = ?", [cuenta], (error, rows) => {
                     if (error) {console.log(error)}
                     if (rows.length > 0) {
                        res.render('nuevoMedidor', {
                           alertSalir: false, codigo: '', cuenta: '', ingreso: '',
                           alert: true,
                           alertTitle: 'info',
                           alertMessage: 'El número de cuenta pertenece a otro usuario',
                           alertIcon: 'info',
                           showConfirmButton: true,
                           timer: false,
                           ruta: '/nuevoMedidor?cliente='+idCliente +"&prop=" + prop
                        })
                     } 
                     
                     else {
                        
                        if(l_ingreso < 12){
                           res.render('nuevoMedidor', {
                             
                              alertSalir: false, codigo: '', cuenta: '', ingreso: '',
                              alert: true,
                              alertTitle: 'info',
                              alertMessage: 'La lectura de ingreso no puede ser inferior que 12 m3',
                              alertIcon: 'info',
                              showConfirmButton: true,
                              timer: false,
                              ruta: '/nuevoMedidor?cliente='+idCliente +"&prop=" + prop
                           })
                        }else{
                           conexion.query('INSERT INTO medidores SET ?', {
                              id_cliente: idCliente,
                              cod_Medidor: codMedidor,
                              cuenta: cuenta,
                              lectura_ingreso: l_ingreso,
                              f_ingreso: f_ingreso.toLocaleDateString('zh-Hans-CN'),
                              estado: estado,
                              estado_lectura : estado_lectura
                           }, (error, results) => {
                              if (error) {
                                 console.log(error)
                              } else {
                                 res.redirect('/clientes')
                              }
                           })
                        }

                     }

                  })
               }
            })
         }
      })



   } catch (error) {
      console.log(error)
   }

}
//EDITAR MEDIDOR
exports.editar = (req, res) => {
   try {
      const id = req.body.idMedidor
      const ubicacion = req.body.ubicacion
      conexion.query('UPDATE medidores SET ? WHERE id = ?', [{
         ubicacion: ubicacion
      }, id], (error, results) => {

         if (error) {
            console.log(error)
         } else {
            res.redirect('/medidores')
         }
      })

   } catch (error) {
      console.log(error)
   }
}
exports.reporte = (req, res) => {

   const doc = new pdf({bufferPage: true})
   const fecha = new Date()
   const filename = `reporteMedidores${Date.now()}.pdf`
   const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-disposition': 'attachment; filename=' + filename
   })


   doc.on('data', (data) => {stream.write(data)})
   doc.on('end', () => {stream.end()})

   doc.setDocumentHeader({height: '16'}, 
   () => {
      doc.image('public/img/logo1.png', 50, 45, {width: 50})
         .fontSize(20).text('GAD Municipal de Mocha', 100, 57)
         .fontSize(10).text('Reporte de Medidores', 200, 65, {align: 'right'})
         .fontSize(10).text('Fecha: ' + fecha.toLocaleDateString('zh-Hans-CN'), 200, 80, {align: 'right'})
         .moveDown();
   })

   const datos = conexion.query('select cod_Medidor, CONCAT(nombres, " ", apellidos)as propietario, cuenta, date_format(m.f_ingreso, "%d-%m-%Y") as f_ingreso, m.estado from medidores m inner join clientes c on m.id_cliente = c.id', (error, results) => {

      if (error) {
         console.log(error)
      }
      doc.addTable([
         {key: 'cod_Medidor',label: 'Cod. Medidor',align: 'center'},
         {key: 'cuenta',label: 'cuenta',align: 'center'},
         {key: 'propietario',label: 'Propietario',align: 'center'},
         {key: 'f_ingreso',label: 'Ingresado en',align: 'center'},
         {key: 'estado',label: 'Estado',align: 'center'}
      ], results, {
         border: {
            size: 0.1,
            color: '#cdcdcd'
         },
         headAlign: 'center',
         width: "fit-content",
         striped: false,
         stripedColors: ["", ""],
         cellsPadding: 10,
         marginLeft: 45,
         marginRight: 45,
         cellsPadding: 5,
         cellsMaxWidth: 250,
         cellsAlign: 'left',
         cellsFontSize: 10,
         cellsFont: "Helvetica",
      })
      doc.render()
      doc.end()
   })
}

// exports.cambiar = async(req, res)=>{
//     const date = new Date()
//     const mes = ('0' + (date.getMonth())).slice(-2)
//     const año = date.getFullYear()
//     const fecha = mes +'-' + año

//     try {
//         conexion.query('select cod_Medidor, nombres, apellidos,lectura_anterior, lectura_actual, consumo, observacion, date_format(fecha, "%d-%m-%Y") as fecha from lecturas l inner join medidores m on l.id_medidor = m.id inner join clientes c on m.id_cliente = c.id WHERE date_format(fecha, "%m-%Y") =?', [fecha], (error, results)=>{
//             if(error){console.log(error)}
//             else{console.log(results)}
//         })

//     } catch (e) {
//         console.log(e)
//     }

// }

exports.habilitar = async (req, res) =>{
   conexion.query('UPDATE medidores SET estado_lectura = "Pendiente" WHERE estado_lectura = "Leído" ', (error,res)=>{
      if(error){console.log}
      else{res.redirect('/lecturas')}
  })
}