const express = require("express");
const multer = require("multer");
const cors = require("cors");
const router = express.Router();
const path = require("path");
const db = require("../database/models");
const Mensaje = db.Mensaje;
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/img/pets"));
  },
  filename: (req, file, cb) => {
    /*    console.log(file); */
    const newFilename = "file" + Date.now() + path.extname(file.originalname);
    cb(null, newFilename);
    req.session.newFileName = newFilename;
  },
});
const upload = multer({ storage });

const sequelize = new Sequelize("missingPets", "root", "nabuco12", {
  host: "localhost",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

router.post("/mensajes/nuevoMensaje/", async (req, res) => {
  console.log(req.body);

  await Mensaje.create({
    mensaje: req.body.msg.msg,
    emailEmisor: req.body.emisor,
    emailReceptor: req.body.receptor,
    fechaMensaje: req.body.date,
  });
  res.status(200).send();
});

const modelQuery =
  "select a.mensaje, b.nombre, c.nombre from mensajes a left join humanos b on b.idHumano = a.idEmisor left join humanos c on c.idhumano = a.idReceptor where a.idEmisor =";
const messageByReceptor =
  "select a.mensaje, b.nombre , c.idHumano from mensajes a left join humanos b on b.idHumano =a.idEmisor left join humanos c on c.idHumano =b.idhumano where a.idReceptor = ";
const reqForQuery = "  and a.idReceptor =";

const messageByReceptor2 =
  "select a.mensaje,c.email from mensajes where a.emailReceptor =";
const reqForQuery2 = "  and a.emailReceptor =";

router.get("/mensajes/getAllMyMsg/:id", async (req, res) => {
  let id = req.params.id;

  await Mensaje.findAll({
    where: {
      emailReceptor: id,
      /*         { idReceptor: idEmisor, idEmisor: id }  */
    },
  }).then((mensajes) => {
    return res.status(200).send({data:mensajes});
  });
  /*     order: [
            ['id', 'DESC'],


        ], */
});
/* 
    sequelize.query(messageByReceptor2 + id).then(function (mensajes) {


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
 */

router.get("/mensajes/getMessagesById/:id/:idEmisor", async (req, res) => {
  let id = req.params.id;
  let idEmisor = req.params.idEmisor;
  console.log(id, idEmisor);

  await Mensaje.findAll({
    where: {
      [Op.or]: [
        { emailReceptor: id, emailEmisor: idEmisor },
        { emailReceptor: idEmisor, emailEmisor: id },
      ],
    },
    order: [["id", "DESC"]],
  }).then(
    await function (mensajes) {
      return res.status(200).send({ data: mensajes });
    }
  );
});

module.exports = router;
