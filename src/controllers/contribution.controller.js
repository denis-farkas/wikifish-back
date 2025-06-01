import { ContributionDB } from "../databases/contribution.database.js";
import { EspeceDB } from "../databases/espece.database.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fish_species/contributions",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto" },
      { format: "auto" },
    ],
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
]);

// Fonction pour créer une contribution
const createContribution = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de l'upload des images",
        error: err.message,
      });
    }

    try {
      const {
        date_creation,
        validation = 0,
        user_id,
        id_espece,
        nom_commun,
        nom_scientifique,
        description,
        taille_max,
        alimentation,
        temperature,
        dificulte,
        cree_le,
        id_temperament,
        id_famille,
        id_habitat,
      } = req.body;

      // URLs Cloudinary des images uploadées
      const image_1 = req.files["image_1"]
        ? req.files["image_1"][0].path
        : null;
      const image_2 = req.files["image_2"]
        ? req.files["image_2"][0].path
        : null;
      const image_3 = req.files["image_3"]
        ? req.files["image_3"][0].path
        : null;

      // Validation
      if (!nom_commun || !nom_scientifique || !id_espece) {
        return res.status(400).json({
          message:
            "Les champs nom_commun, nom_scientifique et id_espece sont requis",
        });
      }

      const response = await ContributionDB.createContribution(
        date_creation,
        validation,
        user_id,
        id_espece,
        nom_commun,
        nom_scientifique,
        description,
        taille_max,
        alimentation,
        temperature,
        dificulte,
        cree_le,
        id_temperament,
        id_famille,
        id_habitat,
        image_1,
        image_2,
        image_3
      );

      if (response.error) {
        return res.status(500).json({ message: response.error });
      }

      return res.status(201).json({
        message: "Contribution créée avec succès",
        contribution: response.result,
      });
    } catch (error) {
      console.error("Contribution creation error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
};

// Fonction pour récupérer toutes les contributions
const readContributions = async (req, res) => {
  try {
    const response = await ContributionDB.readContributions();

    if (response.error) {
      return res.status(500).json({ message: response.error });
    }

    const contributions = response.result || [];
    return res.status(200).json({ message: "OK", contributions });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Fonction pour récupérer les contributions d'un utilisateur
const readUserContributions = async (req, res) => {
  try {
    const user_id = req.params.userId;

    if (!user_id) {
      return res.status(400).json({ message: "ID utilisateur requis" });
    }

    const response = await ContributionDB.readUserContributions(user_id);

    if (response.error) {
      return res.status(500).json({ message: response.error });
    }

    const contributions = response.result || [];
    return res.status(200).json({ message: "OK", contributions });
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Fonction pour récupérer une contribution spécifique
const readOneContribution = async (req, res) => {
  try {
    const id_contribution = req.params.id_contribution;

    if (!id_contribution) {
      return res.status(400).json({ message: "ID contribution requis" });
    }

    const response = await ContributionDB.readOneContribution(id_contribution);

    if (response.error) {
      return res.status(500).json({ message: response.error });
    }

    if (!response.result || response.result.length === 0) {
      return res.status(404).json({ message: "Contribution non trouvée" });
    }

    const result = response.result[0];

    const contribution = {
      id_contribution,
      date_creation: result.date_creation,
      validation: result.validation,
      user_id: result.user_id,
      id_espece: result.id_espece,
      nom_commun: result.nom_commun,
      nom_scientifique: result.nom_scientifique,
      description: result.description,
      taille_max: result.taille_max,
      alimentation: result.alimentation,
      temperature: result.temperature,
      dificulte: result.dificulte,
      cree_le: result.cree_le,
      id_temperament: result.id_temperament,
      id_famille: result.id_famille,
      id_habitat: result.id_habitat,
      image_1: result.image_1,
      image_2: result.image_2,
      image_3: result.image_3,
    };

    return res.status(200).json({ message: "Requête OK", contribution });
  } catch (error) {
    console.error("Error fetching contribution:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Fonction pour modifier une contribution
const updateContribution = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        message: "Erreur lors de l'upload des images",
        error: err.message,
      });
    }

    try {
      const authenticatedUserId = req.body.user_id;
      const { id_contribution } = req.body;

      if (!id_contribution) {
        return res.status(400).json({ message: "ID contribution requis" });
      }

      // Vérifier si la contribution existe et appartient à l'utilisateur
      const existingContribution = await ContributionDB.readOneContribution(
        id_contribution
      );

      if (
        !existingContribution ||
        !existingContribution.result ||
        existingContribution.result.length === 0
      ) {
        return res.status(404).json({ message: "Contribution non trouvée" });
      }

      if (existingContribution.result[0].user_id != authenticatedUserId) {
        return res.status(403).json({
          message:
            "Accès refusé: vous ne pouvez modifier que vos propres contributions",
        });
      }

      const currentContribution = existingContribution.result[0];

      const {
        id_espece,
        nom_commun,
        nom_scientifique,
        description,
        taille_max,
        alimentation,
        temperature,
        dificulte,
        cree_le,
        id_temperament,
        id_famille,
        id_habitat,
      } = req.body;

      const convertToMySQLDateTime = (isoDate) => {
        if (!isoDate) return null;
        const date = new Date(isoDate);
        return date.toISOString().slice(0, 19).replace("T", " ");
      };

      // ✅ Utiliser les nouvelles images si uploadées, sinon garder les anciennes
      const image_1 = req.files["image_1"]
        ? req.files["image_1"][0].path
        : currentContribution.image_1; // Garder l'ancienne image

      const image_2 = req.files["image_2"]
        ? req.files["image_2"][0].path
        : currentContribution.image_2; // Garder l'ancienne image

      const image_3 = req.files["image_3"]
        ? req.files["image_3"][0].path
        : currentContribution.image_3; // Garder l'ancienne image

      const mysqlDateCreation = convertToMySQLDateTime(
        currentContribution.date_creation
      );
      const mysqlCreeLe = convertToMySQLDateTime(cree_le);

      // ✅ Utiliser la date_creation existante au lieu de celle du frontend
      const response = await ContributionDB.updateContribution(
        id_contribution,
        mysqlDateCreation, // Garder la date originale
        id_espece,
        nom_commun,
        nom_scientifique,
        description,
        taille_max,
        alimentation,
        temperature,
        dificulte,
        mysqlCreeLe,
        id_temperament,
        id_famille,
        id_habitat,
        image_1,
        image_2,
        image_3
      );

      if (response.error) {
        return res.status(500).json({ message: response.error });
      }

      return res.status(200).json({
        message: `La contribution numéro ${id_contribution} a été modifiée`,
      });
    } catch (error) {
      console.error("Update contribution error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
};
// Fonction pour modifier la validation d'une contribution
const updateValidation = async (req, res) => {
  try {
    const { id_contribution } = req.params;
    const { validation } = req.body;

    if (!id_contribution || validation === undefined) {
      return res.status(400).json({
        message: "ID contribution et validation sont requis",
      });
    }

    const response = await ContributionDB.updateValidation(
      validation,
      id_contribution
    );

    if (response.error) {
      return res.status(500).json({ message: response.error });
    }

    // Si la contribution est validée, mettre à jour l'espèce
    if (validation === 1 || validation === "1" || validation === true) {
      const contributionData = await ContributionDB.readOneContribution(
        id_contribution
      );

      if (
        !contributionData ||
        !contributionData.result ||
        contributionData.result.length === 0
      ) {
        return res.status(404).json({ message: "Contribution non trouvée" });
      }

      const contribution = contributionData.result[0];

      // Récupérer les données actuelles de l'espèce
      const currentSpeciesData = await EspeceDB.readOneEspece(
        contribution.id_espece
      );

      if (
        currentSpeciesData.error ||
        !currentSpeciesData.result ||
        currentSpeciesData.result.length === 0
      ) {
        return res.status(404).json({ message: "Espèce non trouvée" });
      }

      const currentSpecies = currentSpeciesData.result[0];

      // Créer une date au format MySQL (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");

      // Utiliser les images de la contribution si elles existent, sinon garder celles de l'espèce
      const image_1 = contribution.image_1 || currentSpecies.image_1 || "";
      const image_2 = contribution.image_2 || currentSpecies.image_2 || "";
      const image_3 = contribution.image_3 || currentSpecies.image_3 || "";

      // Mettre à jour l'espèce avec les données de la contribution
      const speciesResponse = await EspeceDB.updateEspece(
        contribution.nom_commun,
        contribution.nom_scientifique,
        contribution.description,
        contribution.taille_max,
        contribution.alimentation,
        contribution.temperature,
        contribution.dificulte,
        contribution.cree_le,
        mysqlDateTime, // Format MySQL: 2025-06-01 09:25:28
        contribution.id_temperament,
        contribution.id_famille,
        contribution.id_habitat,
        id_contribution,
        image_1, // Image de la contribution ou image existante de l'espèce
        image_2, // Image de la contribution ou image existante de l'espèce
        image_3, // Image de la contribution ou image existante de l'espèce
        contribution.id_espece
      );

      if (speciesResponse.error) {
        // Réverter la validation si la mise à jour de l'espèce échoue
        await ContributionDB.updateValidation(0, id_contribution);
        return res.status(500).json({
          message:
            "La validation n'a pas été mise à jour car l'espèce n'a pas pu être modifiée",
          error: speciesResponse.error,
        });
      }
    }

    return res.status(200).json({
      message: `La validation de la contribution ${id_contribution} a été mise à jour`,
    });
  } catch (error) {
    console.error("Error in updateValidation:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la validation",
    });
  }
};

// Fonction pour supprimer une contribution
const deleteOneContribution = async (req, res) => {
  try {
    const id_contribution = req.params.id_contribution;

    if (!id_contribution) {
      return res.status(400).json({ message: "ID contribution requis" });
    }

    const response = await ContributionDB.deleteOneContribution(
      id_contribution
    );

    if (response.error) {
      return res.status(500).json({ message: response.error });
    }

    return res
      .status(200)
      .json({ message: "Contribution supprimée avec succès" });
  } catch (error) {
    console.error("Delete contribution error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Exportation des fonctions du contrôleur
export const ContributionController = {
  createContribution,
  readContributions,
  readUserContributions,
  readOneContribution,
  updateContribution,
  updateValidation,
  deleteOneContribution,
};
