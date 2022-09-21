const conexion = require('../database/db')
const pdf = require ('pdfkit-construct');


exports.buscar = async(req, res)=>{
    const fecha = req.body.fecha
    try {
        conexion.query('select cod_Medidor,direccion, nombres, apellidos,lectura_anterior, lectura_actual,consumo, observacion, date_format(fecha, "%d-%m-%Y") as fecha from lecturas l inner join medidores m on l.id_medidor = m.id inner join clientes c on m.id_cliente = c.id WHERE date_format(fecha, "%m-%Y") =? ORDER BY direccion;', [fecha], (error, results)=>{
            if(error){console.log(error)}
            else{res.render('lecturas' ,{fecha : fecha ,results: results})}
        })

    } catch (e) {
        console.log(e)
    }
}



exports.reporte= async (req, res) => {

    const doc = new pdf({bufferPage: true})
    const fechaD = new Date()
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
          .fontSize(10).text('Fecha: ' + fechaD.toLocaleDateString('zh-Hans-CN'), 200, 80, {align: 'right'})
          .moveDown();
    })    
 
     conexion.query('select cod_Medidor, CONCAT(nombres, " ", apellidos)as propietario ,lectura_anterior, lectura_actual, consumo, observacion, date_format(fecha, "%d-%m-%Y") as fecha from lecturas l inner join medidores m on l.id_medidor = m.id inner join clientes c on m.id_cliente = c.id',  (error, results) => {
       if (error) {
          console.log(error)
       }
       doc.addTable([
          {key: 'cod_Medidor',label: 'Cod. Medidor',align: 'center'},
          {key: 'propietario',label: 'Propietario',align: 'center'},
          {key: 'lectura_anterior',label: 'Lec.Anterior',align: 'center'},
          {key: 'lectura_actual',label: 'Lec.Actual',align: 'center'},
          {key: 'consumo',label: 'Consumo',align: 'center'},
          {key: 'observacion',label: 'Observaciones',align: 'center'},
          {key: 'fecha',label: 'Fecha',align: 'center'}
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







