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
import {
  user_collection,
  record_collection,
  stock_collection,
} from "./mongo.js";

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

app.post("/api/momentum", async (req, res) => {
  try {
    console.log("Enter Express /api/momentum");
    const symbols = req.body.symbols;
    // const flaskResponse = await axios.post(
    //   "http://127.0.0.1:5002/predict-momentum",
    //   {
    //     symbols,
    //   }
    // );
    // res.json(flaskResponse.data);
  } catch (error) {
    console.error(
      "Error fetching from Flask when predicting momentums:",
      error
    );
    res.status(500).send("Error in momentum prediction");
  }
});

app.post("/api/optimize", async (req, res) => {
  try {
    console.log("Enter Express /api/optimze (weights)");
    const symbols = req.body.symbols; // Symbols sent from React
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5002/optimize-portfolio",
      {
        symbols,
      }
    );

    res.json(flaskResponse.data); // Return Flask's response to React
  } catch (error) {
    console.error("Error fetching from Flask when optimizing weights:", error);
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
    console.log("checkExist / checkMatch", checkExist, checkMatch);

    if (!checkExist) {
      res.json("notexist");
    } else if (!checkMatch) {
      res.json("notmatch");
    } else {
      // res.json("success");
      console.log("success");
      try {
        const records = await user_collection
          .find({ email: email, password: password })
          .select("email password phone username history alertType")
          .exec();
        console.log(records);
        res.status(200).json({ message: "success", overhead: records[0] });
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    }
  } catch (e) {
    res.json("fail");
  }
});

app.post("/alertPref", async (req, res) => {
  const { email, alertType, triggerType, thresholds } = req.body;
  try {
    const updatedRecord = await user_collection.findOneAndUpdate(
      { email }, // match condition
      {
        $set: {
          alertType: alertType,
          triggerType: triggerType,
          thresholds: thresholds,
        },
      },
      { new: true }
    );
    if (updatedRecord) {
      console.log("alertType updated successfully:", updatedRecord);
      res.json("success");
    } else {
      console.log("No matching email record found.");
      res.json("notfound");
    }
  } catch (error) {
    console.error("Error during alertType update", error);
    res.json("error");
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
    alertType: "null",
  };

  try {
    const accountExist = await user_collection.findOne({
      $or: [{ phone }, { email }],
    });
    const usernameExist = await user_collection.findOne({ username });

    if (accountExist) {
      res.json("accountExist");
    } else if (usernameExist) {
      res.json("usernameExist");
    } else {
      await user_collection.create(data);
      return res.status(200).json({ message: "newUser" });
    }
  } catch (e) {
    console.log(e);
    res.json("fail");
  }
});

app.post("/record", async (req, res) => {
  const { params, weightPercents } = req.body;
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
  try {
    await record_collection.create(data);
    return res.json("success");
  } catch (e) {
    res.json("An error occurs when saving query record to mongo");
  }
});

app.get("/history", async (req, res) => {});

app.post("/api/savestock", async (req, res) => {
  console.log("Enter api/savestock");
  const { stockDocument } = req.body;
  print(stockDocument);

  if (!stockDocument || !stockDocument.symbol || !stockDocument.timeSeries) {
    return res.status(400).json({ error: "Invalid stockDocument format" });
  }

  try {
    // Check if the stock already exists
    const existingStock = await stock_collection.findOne({
      symbol: stockDocument.symbol,
    });

    if (!existingStock) {
      // No record exists: Insert the new stock data
      const newStock = await stock_collection.create({
        symbol: stockDocument.symbol,
        timeSeries: stockDocument.timeSeries,
        lastUpdated: new Date(),
      });

      return res.status(200).json({
        message: "Stock data inserted successfully",
        data: newStock,
      });
    } else {
      // Record exists: Merge and de-duplicate time series
      const existingData = existingStock.timeSeries;
      const newData = stockDocument.timeSeries;
      const combinedData = [
        ...existingData,
        ...newData.filter(
          (newEntry) =>
            !existingData.some(
              (existingEntry) => existingEntry.date === newEntry.date
            )
        ),
      ];

      // Sort by timestamp
      combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Update the time series and save
      existingStock.timeSeries = combinedData;
      existingStock.lastUpdated = new Date();

      const updatedStock = await existingStock.save();

      return res.status(200).json({
        message: "Stock data updated successfully",
        data: updatedStock,
      });
    }
  } catch (error) {
    console.error("Error saving stock data:", error);
    return res.status(500).json({ error: "Failed to save/update stock data" });
  }
});

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
