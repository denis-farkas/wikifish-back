import express from "express";
import initRoutes from "./routes/init.routes.js";
import initMiddlewares from "./middlewares/init.middleware.js";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
// Port sur lequel le serveur écoutera les connexions
const PORT = process.env.PORT;
console.log("PORT:", process.env.PORT);

// Création de l'application Express
const app = express();
const cors = require("cors");

const allowedOrigins = [
  "https://www.wikifish.horizonduweb.fr",
  "https://wikifish.horizonduweb.fr",
  "http://localhost:3012",
  "http://127.0.0.1:3012",
  "http://82.165.231.216:3012",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());
// Initialisation des middlewares (gestionnaires intermédiaires)
initMiddlewares(app);

// Initialisation des routes de l'application
initRoutes(app);
app.use("/uploads", express.static("uploads"));
// Écoute du serveur sur le port spécifié
app.listen(PORT, () => {
  console.log("Le serveur écoute sur le PORT:", PORT);
});
