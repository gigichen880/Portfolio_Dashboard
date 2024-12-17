import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";
import axios from "axios";
import candleRoutes from "./routes/testData.js";
import { user_collection, record_collection } from "./mongo.js";

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

app.post("/api/optimize", async (req, res) => {
  try {
    console.log("Enter Express JS");
    const symbols = req.body.symbols; // Symbols sent from React
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5002/optimize-portfolio",
      {
        symbols,
      }
    );

    res.json(flaskResponse.data); // Return Flask's response to React
  } catch (error) {
    console.error("Error fetching from Flask:", error);
    res.status(500).send("Error in portfolio optimization");
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const checkExist = await user_collection.findOne({ email: email });
    const checkMatch = await user_collection.findOne({
      email: email,
      password: password,
    });

    if (!checkExist) {
      res.json("notexist");
    } else if (!checkMatch) {
      res.json("notmatch");
    } else {
      res.json("success");
    }
  } catch (e) {
    res.json("fail");
  }
});

app.post("/signup", async (req, res) => {
  // username, phone, email, password
  const { username, phone, email, password } = req.body;

  const data = {
    username: username,
    phone: phone,
    email: email,
    password: password,
  };
  console.log(data);

  try {
    const accountExist = await user_collection.findOne({
      $or: [{ phone }, { email }],
    });
    console.log("who", accountExist);
    const usernameExist = await user_collection.findOne({ username });

    if (accountExist) {
      res.json("accountExist");
    } else if (usernameExist) {
      res.json("usernameExist");
    } else {
      console.log("here!");
      await user_collection.create(data);
      return res.status(200).json({ message: "newUser", userId: user._id });
    }
  } catch (e) {
    res.json("fail");
  }
});
// from: cData.from,
// to: cData.to,
// numSpan: cData.numSpan,
// timeSpan: cData.timeSpan,
// symbol: cData.symbol,

app.post("/record", async (req, res) => {
  const { params, weightPercents } = req.body;
  console.log("params", params);
  const startTime = params.from;
  const endTime = params.to;
  const numSpan = params.numSpan;
  const timeSpanUnit = params.timeSpan;
  let portfolio = [];
  for (let pair in zip(params.symbol, weightPercents)) {
    let symbolName = pair[0];
    let weight = pair[1];
    let symPair = { symbolName: symbolName, weight: weight };
    portfolio.concat(symPair);
  }

  const data = {
    portfolio: portfolio,
    startTime: startTime,
    endTime: endTime,
    numSpan: numSpan,
    timeSpanUnit: timeSpanUnit,
  };
  console.log(data);
  try {
    await record_collection.create(data);
    return res.json("success");
  } catch (e) {
    res.json("An error occurs when saving query record to mongo");
  }
});

app.get("/history", async (req, res) => {});

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
  });
// .catch((error) => console.log(`${error} did not connect`));
