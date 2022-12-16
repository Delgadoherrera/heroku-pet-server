const express = require("express");
const multer = require("multer");
const cors = require("cors");
const router = express.Router();
const path = require("path");
const db = require("../database/models");
const Mascota = db.Mascota;
const MascotaEncontrada = db.MascotaEncontrada;
const jwt = require("jsonwebtoken");
var Sequelize = require("sequelize");
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

const gradosARadianes = (grados) => {
  return (grados * Math.PI) / 180;
};

const distanciaCoords = (lat1, lon1, lat2, lon2) => {
  lat1 = gradosARadianes(lat1);
  lon1 = gradosARadianes(lon1);
  lat2 = gradosARadianes(lat2);
  lon2 = gradosARadianes(lon2);

  const radioTierra = 6371;
  let difLng = lon2 - lon1;
  let difLat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(difLat / 2.0), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(difLng / 2.0), 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radioTierra * c;
};

router.post("/mascota/register", upload.single("file"), async (req, res) => {
  /*     let sent = JSON.parse(req.body.formDatas) */

  console.log(req.body);
  let sent = req.body.formdata;
  await Mascota.create({
    nombre: sent.nombre,
    emailMascota: sent.emailMascota,
    colorPrimario: sent.colorPrimario,
    colorSecundario: sent.colorSecundario,
    pesoAproximado: sent.pesoAproximado,
    status: 0,
    tipoMascota: sent.tipoMascota,
    descripcion: sent.descripcionMascota,
    fotoMascota: req.body.file.base64Data,
    geoAdress: "No está perdida",
  });
  res.status(200).send();
});

router.get("/mascotas/getById/:id", async (req, res) => {
  console.log(req.body);
  await Mascota.findAll({
    where: {
      idHumano: req.params.id,
      status: { [Op.ne]: 3 },
    },
  }).then(
    await function (mascotas) {
      return res.status(200).send({ data: mascotas });
    }
  );
});

router.post("/mascotas/mascotaPerdida/:id", async (req, res) => {
  let lugarEncontrada = req.body.lugarEncontrado.join(",");

  Mascota.update(
    {
      latPerdida: req.body.state.latitude,
      lngPerdida: req.body.state.longitude,
      geoAdress: lugarEncontrada,

      status: 1,
    },
    {
      where: { idMascota: req.params.id },
    }
  ).catch((error) => res.send(error));
  res.status(200).send();
});

router.post("/mascotas/mascotaPerdidaNewLocation/:id", async (req, res) => {
  console.log(req.body);
  let lugarEncontrada = req.body.lugarEncontrado.join(",");

  Mascota.update(
    {
      latPerdida:
        req.body.sendLocation[req.body.sendLocation.length - 1].latitude,
      lngPerdida:
        req.body.sendLocation[req.body.sendLocation.length - 1].longitude,
      geoAdress: lugarEncontrada,

      status: 1,
    },
    {
      where: { idMascota: req.params.id },
    }
  ).catch((error) => res.send(error));
  res.status(200).send();
});
router.get("/mascotas/mascotasPerdidas", async (req, res) => {
  const mascotasCercanas = [];
  await Mascota.findAll({
    where: { status: { [Op.in]: [1, 3] } },
  })
    .then(function (mascotas) {
      if (mascotas.length > 0) {
        mascotas.forEach((j) => {
          let distance = distanciaCoords(
            req.headers.latitude,
            req.headers.longitude,
            j.latPerdida,
            j.lngPerdida
          );

          if (distance < req.headers.distanceslider) {
            console.log(j.nombre, "esta cerca!");
            mascotasCercanas.push(j);
          } else {
            console.log("aun no hay mascotas cerca");
          }

          /* console.log('distance', distance) */
        });
        console.log("MASCOTAS ENCONTRADAS: ", mascotasCercanas);
        return res.status(200).send({ data: mascotasCercanas });
      } else if (!mascotas) {
        Mascota.findAll({
          where: { status: { [Op.in]: [1, 3] } },
        }).then(function (mascotas) {
          console.log("MASCOTAS NO ENCCONTRADA: ", mascotas);

          return res.status(200).send({ data: mascotas });
        });

        console.log("No hay mascotas perdidas actualmente en tu zona.");
        /*         return res.status(400) */
      }
    })
    .catch((error) => {
      console.log("error catch" + error);
    });
});

router.get("/mascotas/mascotaEncontrada", async (req, res) => {
  console.log(req.body);
  console.log(req.params.file.base64Data);

  MascotaEncontrada.findAll({
    where: {
      status: 1,
    },
  })
    .then(function (encontradas) {
      if (encontradas) {
        return res.status(200).send({ data: encontradas });
      } else if (!encontradas) {
        console.log("No se han encontrado mascotas perdidas por tu zona");
        return res.status(400);
      }
    })
    .catch((error) => {
      console.log("error catch" + error);
    });
});

router.post("/mascotas/nuevaMascotaPerdida", async (req, res) => {
  console.log(req.body);

  let lugarEncontrada = req.body.lugarEncontrado.join(",");

  console.log("Lugar encontrada: ", lugarEncontrada);

  let sent = req.body.formDatas;

  await Mascota.create({
    nombre: "",
    emailMascota: sent.emailMascota,
    colorPrimario: sent.colorPrimario,
    colorSecundario: sent.colorSecundario,
    pesoAproximado: sent.pesoAproximado,
    status: 3,
    tipoMascota: sent.tipoMascota,
    descripcion: sent.descripcionMascota,
    fotoMascota: req.body.file.base64Data,
    latPerdida: sent.newLatitude,
    lngPerdida: sent.newLongitude,
    geoAdress: lugarEncontrada,
  });
  res.status(200).send();
});
router.post(
  "/mascotas/mascotaEncontrada/:id",
  upload.single("file"),
  async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    Mascota.update(
      {
        status: 0,
        latPerdida: 0,
        lngPerdida: 0,
      },
      {
        where: { idMascota: req.params.id },
      }
    );
    res.status(200).send();
  }
);

router.post("/mascotas/borrarMascota/:id", async (req, res) => {
  await Mascota.destroy({
    where: {
      idMascota: req.params.id,
    },
  });

  res.status(200).send("success");
});

router.post("/mascotas/editarMascota/:id", async (req, res) => {
  let sent = req.body.formdata;
  console.log("params", req.params.id);
  console.log("body", req.body);
  console.log("sent", sent.nombre);
  await Mascota.update(
    {
      nombre: sent.nombre,
      colorPrimario: sent.colorPrimario,
      colorSecundario: sent.colorSecundario,
      pesoAproximado: sent.pesoAproximado,
      tipoMascota: sent.tipoMascota,
      descripcion: sent.descripcionMascota,
    },
    {
      where: {
        idMascota: req.params.id,
      },
    }
  );

  res.status(200).send("success");
});

// NEW DESIGN

router.get("/mascotas/getMyPets/:email", async (req, res) => {
  console.log(req.params.email);
  await Mascota.findAll({
    where: {
      emailMascota: req.params.email,
      status: { [Op.ne]: 3 },
    },
  }).then(
    await function (mascotas) {
      return res.status(200).send({ data: mascotas });
    }
  );
});
router.post("/mascotas/adopcion/:id", async (req, res) => {
  console.log(req.body);
  if (req.body.adoptar === true) {
    Mascota.update(
      {
        status: 4,
        latPerdida: req.body.latitude,
        lngPerdida: req.body.longitude,
      },
      {
        where: { idMascota: req.params.id },
      }
    ).catch((error) => res.send(error));
  } else if (req.body.adoptar === false) {
    Mascota.update(
      {
        status: 0,
      },
      {
        where: { idMascota: req.params.id },
      }
    ).catch((error) => res.send(error));
  }

  res.status(200).send("success");
});
router.get("/mascotas/mascotasEnAdopcion", async (req, res) => {
  const mascotasCercanas = [];
  Mascota.findAll({
    where: { status: 4 },
  })
    .then(function (mascotas) {
      if (mascotas) {
        mascotas.forEach((j) => {
          let distance = distanciaCoords(
            req.headers.latitude,
            req.headers.longitude,
            j.latPerdida,
            j.lngPerdida
          );

          if (distance < req.headers.distanceslider) {
            console.log(j.nombre, "esta cerca!");
            mascotasCercanas.push(j);
          } else {
            console.log("aun no hay mascotas cerca");
          }
        });
        return res.status(200).send({ data: mascotasCercanas });
      } else if (!mascotas) {
        console.log("No hay mascotas perdidas actualmente en tu zona.");
        /*         return res.status(400) */
      }
    })
    .catch((error) => {
      console.log("error catch" + error);
    });
});
module.exports = router;

//mascota status 4 = en adopcion
