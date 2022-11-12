const express = require('express');
const multer = require('multer');
const cors = require('cors');
const router = express.Router();
const path = require('path')
const db = require("../database/models")
const Mensaje = db.Mensaje;
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/img/pets"));
    },
    filename: (req, file, cb) => {
        /*    console.log(file); */
        const newFilename = "file" + Date.now() + path.extname(file.originalname);
        cb(null, newFilename);
        req.session.newFileName = newFilename
    }

});
const upload = multer({ storage })


const sequelize = new Sequelize('missingpet', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})



router.post("/mensajes/nuevoMensaje/", async (req, res) => {
    console.log(req.body)

    await Mensaje.create({
        mensaje: req.body.msg.msg,
        idEmisor: req.body.emisor,
        idReceptor: req.body.receptor,
        fechaMensaje: req.body.date,
    });
    res.status(200).send()
})

const modelQuery = "select a.mensaje, b.nombre, c.nombre from mensajes a left join humanos b on b.idHumano = a.idEmisor left join humanos c on c.idhumano = a.idReceptor where a.idEmisor ="
const messageByReceptor = "select a.mensaje, b.nombre , c.idHumano from mensajes a left join humanos b on b.idHumano =a.idEmisor left join humanos c on c.idHumano =b.idhumano where a.idReceptor = "
const reqForQuery = "  and a.idReceptor ="

router.get("/mensajes/getAllMyMsg/:id", async (req, res) => {
    let id = req.params.id

    sequelize.query(messageByReceptor + id).then(function (mensajes) {


        if (mensajes) {
            return res.status(200).send({ data: mensajes })
        }
        else if (!mensajes) {
            console.log('No se han encontrado mascotas perdidas por tu zona')
            return res.status(400)
        }
    }).catch((error) => {
        console.log('error catch' + error)
    })

})


router.get("/mensajes/getMessagesById/:id/:idEmisor", async (req, res) => {
    let id = req.params.id
    let idEmisor = req.params.idEmisor
    console.log(id, idEmisor)

    await Mensaje.findAll({
        where: {
            [Op.or]: [{ idReceptor: id, idEmisor: idEmisor },{ idReceptor: idEmisor, idEmisor: id } ],

        },
        order: [
            ['id', 'DESC'],


        ],
    }).then(await function (mensajes) {
        return res.status(200).send({ data: mensajes })
    })


})




module.exports = router;



