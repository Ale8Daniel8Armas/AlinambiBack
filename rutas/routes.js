const express = require("express");
const userController = require("../controlador/userController.js");
const fileController = require("../controlador/fileController.js");
const teamMemberController = require("../controlador/teamMemberController.js");
const teachersMembersController = require("../controlador/docentesPicController.js");
const misionController = require("../controlador/misionController.js");
const visionController = require("../controlador/visionController.js");
const matriculaController = require("../controlador/matriculaController.js");

const { upload } = require("../utils/multerConfig.js");

const router = express.Router();

// Ruta para autenticación de usuario
router.post("/login", userController.login);

// Rutas para usuarios
router.get("/users", userController.getUsers); // Obtener todos los usuarios
router.get("/users/:id", userController.getUserById); // Obtener un usuario por ID
router.post("/users", userController.createUser); // Crear un nuevo usuario
router.put("/users/:id", userController.updateUser); // Actualizar un usuario
router.delete("/users/:id", userController.deleteUser); // Eliminar un usuario

// Rutas para manejo de archivos

// Subir archivo
router.post("/upload", upload.single("file"), fileController.uploadFile);
// Obtener archivos por etiqueta
router.get("/files/tag/:etiqueta", fileController.getFilesByTag);
// Eliminar archivo
router.delete("/files/:fileId", fileController.deleteFile);
// Obtener todos los archivos
router.get("/files", fileController.getFiles);
// Descargar archivo
router.get("/download/:fileId", fileController.downloadFile);
// Obtener un archivo por su ID
router.get("/files/:fileId", fileController.getFileById);

// Rutas para gestionar miembros del consejo estudiantil
router.post(
  "/uploadMember",
  upload.single("image"),
  teamMemberController.createTeamMember
);
router.get("/members", teamMemberController.getTeamMembers);
router.put("/editMember/:id", teamMemberController.editTeamMember);
router.delete("/deleteMember/:id", teamMemberController.deleteTeamMember);

// Rutas para cambiar la imagen de docentes y su descripcion
router.post(
  "/uploadTeachersMembersPic",
  upload.single("imageTeachers"),
  teachersMembersController.createTeachersMembersPic
);
router.get("/teachersPic", teachersMembersController.getTeachersMembersPic);
router.put(
  "/editTeachersPic/:id",
  upload.single("imageTeachers"),
  teachersMembersController.editTeachersMemberPic
);

router.delete(
  "/deleteTeachersPic/:id",
  teachersMembersController.deleteTeachersMemberPic
);

//Rutas para la mision
router.post(
  "/mision",
  upload.single("image"),
  misionController.createOrUpdateMision
);
router.get("/mision", misionController.getMision);
router.delete("/mision", misionController.deleteMision);

//Rutas para la vision
router.post(
  "/vision",
  upload.single("image"),
  visionController.createOrUpdateVision
);
router.get("/vision", visionController.getVision);
router.delete("/vision", visionController.deleteVision);

// Rutas para la información de matrícula

// Crear o actualizar información de matrícula
router.post("/matricula", matriculaController.createOrUpdateMatricula);

// Obtener información de matrícula por tipo
router.get("/matricula/:type", matriculaController.getMatriculaByType);

// Eliminar información de matrícula por tipo
router.delete("/matricula/:type", matriculaController.deleteMatriculaByType);

// Obtener todas las matrículas
router.get("/matricula", matriculaController.getAllMatriculas);

// Editar matrícula por ID
router.put("/matricula/:id", matriculaController.updateMatriculaById);

// Eliminar matrícula por ID
router.delete("/matriculaDelete/:id", matriculaController.deleteMatriculaById);

module.exports = router;
