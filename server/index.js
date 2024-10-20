import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";

import candleRoutes from "./routes/testData.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/kpi", kpiRoutes);
app.use("/candle", candleRoutes);

const MONGO_URL =
  "mongodb+srv://breechen88:Bree20058874824*@findash.lb1gi.mongodb.net/?retryWrites=true&w=majority&appName=FinDash";

console.log(MONGO_URL);
/* MONGOOSE SETUP */
const PORT = 1337 || 9000;
mongoose
  .connect(MONGO_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME ONLY OR AS NEEDED */
    // await mongoose.connection.db.dropDatabase();
    // KPI.insertMany(kpis);
    // Product.insertMany(products);
    // Transaction.insertMany(transactions);
  })
  .catch((error) => console.log(`${error} did not connect`));
