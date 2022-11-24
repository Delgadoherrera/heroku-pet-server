const express = require('express');
const multer = require('multer');
const cors = require('cors');
const router = express.Router();
const path = require('path')
const db = require("../database/models")
const Humano = db.Humano;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
/*  const sequelize = new Sequelize('missingpet', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}) 
 */



router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/img/img-usuarios"));
    },
    filename: (req, file, cb) => {
        /*    console.log(file); */
        const newFilename = "file" + Date.now() + path.extname(file.originalname);
        cb(null, newFilename);
        req.session.newFileName = newFilename
    }

});
const upload = multer({ storage })

router.post("/user/login", async (req, res) => {
    console.log('req.body', req.body)

    let emailVerify = req.body.email
    let password = req.body.password
    await Humano.findOne({
        where: {
            email: emailVerify,
        }
    })
        .then(await function (usuario) {
            if (usuario) {
                const token = jwt.sign(
                    { user_id: usuario._id, email: usuario.email }, // porque esta variable puede ejecutarse de esta manera_ ._id, email
                    "algoSecreto",
                    {
                      expiresIn: "2h",
                    }
                  );
                let dbPassword = usuario.password;
                let key = bcryptjs.compareSync(password, dbPassword);
                Humano.findOne({
                    where: {
                        email: emailVerify,
                        password: key
                    }
                }).then(function () {
                    if (emailVerify === usuario.email && key == true) {
                        let dataUser = {
                            nombre: usuario.nombre,
                            apellido: usuario.apellido,
                            email: usuario.email,
                            id: usuario.idHumano,
                            fotoPerfil: usuario.fotoPerfil
                        }
                        usuario.token= token
                        return res.status(200).json({
                            token: token,
                            dataUser: dataUser
                        })
                    }
                    else if (emailVerify === usuario.email && key == false) {
                        // contraseña incaasdorrecta == 1
                        return res.status(200).json('invalid password')
                    }

                }).catch((error) => {
                    /* console.log('eraaaaror catch' + error) */
                })

            }
            //El mail no se encuenatra ==3
            else {
                return res.status(200).json('No se encuentra el email')
            }
        });

}
)
const salt = 10
router.post("/user/register", async (req, res) => {
    let data = (req.body.formData)
    console.log(req.body.file.base64Data)
    await Humano.findAll({
        where: {
            email: data.email,
        }
    }).then(function (humano) {
        console.log(humano)
        if (humano.length > 0) {
            return res.status(200).send('Porfavor ingresa otro email')
        }
        else if (humano.length === 0) {
            console.log('Este email puede utilizarse')
            if (req.body.file.base64Data !== null) {
                Humano.create({
                    nombre: data.name,
                    apellido: data.apellido,
                    telefono: data.telefono,
                    email: data.email,
                    password: bcryptjs.hashSync(req.body.formData.password, salt),
                    fotoPerfil: req.body.file.base64Data
                });
               return res.status(200).send('success')
            }
            else {
                Humano.create({
                    nombre: data.name,
                    apellido: data.apellido,
                    telefono: data.telefono,
                    email: data.email,
                    password: bcryptjs.hashSync(req.body.formData.password, salt),
                    fotoPerfil: 'userWithNoAvatar'
                });
                return res.status(200).send('success')
            }

        }
    }).catch((error) => {
        console.log('error catch' + error)
    })
})


router.get("/user/userDetail/:id", async (req, res) => {
    console.log('REQODY', req.params.id)
    Humano.findAll({
        where: {
            idHumano: req.params.id,
        }
    }).then(function (humano) {
        if (humano) {
            return res.status(200).send({ data: humano })
        }
        else if (!humano) {
            console.log('No se han encontrado mascotas perdidas por tu zona')
            return res.status(400)
        }
    }).catch((error) => {
        console.log('error catch' + error)
    })
})



module.exports = router;

