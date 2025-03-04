const MatriculaModel = require("../modelos/matriculaModel.js");

// Crear o actualizar información de matrícula
exports.createOrUpdateMatricula = async (req, res) => {
  try {
    const {
      type,
      matriculaFee,
      tuitionFee,
      requiredDocuments,
      importantDates,
    } = req.body;

    // Verificar si ya existe un registro para el tipo de educación
    const existingMatricula = await MatriculaModel.findOne({ type });

    let matricula;
    if (existingMatricula) {
      // Actualizar el registro existente
      matricula = await MatriculaModel.findByIdAndUpdate(
        existingMatricula._id,
        {
          matriculaFee,
          tuitionFee,
          requiredDocuments,
          importantDates,
        },
        { new: true }
      );
    } else {
      // Crear un nuevo registro
      matricula = await MatriculaModel.create({
        type,
        matriculaFee,
        tuitionFee,
        requiredDocuments,
        importantDates,
      });
    }

    res.status(201).json(matricula);
  } catch (error) {
    console.error("Error al crear/actualizar matrícula:", error);
    res.status(500).json({ error: "Error al crear/actualizar matrícula." });
  }
};

// Obtener información de matrícula por tipo
exports.getMatriculaByType = async (req, res) => {
  try {
    const { type } = req.params;
    const matricula = await MatriculaModel.findOne({ type });

    if (!matricula) {
      return res.status(404).json({ error: "Información no encontrada." });
    }

    res.json(matricula);
  } catch (error) {
    console.error("Error al obtener información de matrícula:", error);
    res
      .status(500)
      .json({ error: "Error al obtener información de matrícula." });
  }
};

// Eliminar información de matrícula por tipo
exports.deleteMatriculaByType = async (req, res) => {
  try {
    const { type } = req.params;
    const matricula = await MatriculaModel.findOneAndDelete({ type });

    if (!matricula) {
      return res.status(404).json({ error: "Información no encontrada." });
    }

    res.json({ message: "Información eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar información de matrícula:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar información de matrícula." });
  }
};

// Obtener todas las matrículas
exports.getAllMatriculas = async (req, res) => {
  try {
    const matriculas = await MatriculaModel.find();
    res.json(matriculas);
  } catch (error) {
    console.error("Error al obtener todas las matrículas:", error);
    res.status(500).json({ error: "Error al obtener todas las matrículas." });
  }
};

// Editar matrícula por ID
exports.updateMatriculaById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      matriculaFee,
      tuitionFee,
      requiredDocuments,
      importantDates,
    } = req.body;

    const updatedMatricula = await MatriculaModel.findByIdAndUpdate(
      id,
      {
        type,
        matriculaFee,
        tuitionFee,
        requiredDocuments,
        importantDates,
      },
      { new: true }
    );

    if (!updatedMatricula) {
      return res.status(404).json({ error: "Matrícula no encontrada." });
    }

    res.json(updatedMatricula);
  } catch (error) {
    console.error("Error al editar matrícula:", error);
    res.status(500).json({ error: "Error al editar matrícula." });
  }
};

// Eliminar matrícula por ID
exports.deleteMatriculaById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMatricula = await MatriculaModel.findByIdAndDelete(id);

    if (!deletedMatricula) {
      return res.status(404).json({ error: "Matrícula no encontrada." });
    }

    res.json({ message: "Matrícula eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar matrícula." });
  }
};
