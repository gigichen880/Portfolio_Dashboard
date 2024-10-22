import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CandleSchema = new Schema({
  time: { type: Date },
  high: { type: Number },
  low: { type: Number },
  close: { type: Number },
  open: { type: Number },
  numTx: { type: Number },
  volume: { type: Number },
  volWeightedAvgPrice: { type: Number },
});

const candle = mongoose.model("candle", CandleSchema);

export default candle;
