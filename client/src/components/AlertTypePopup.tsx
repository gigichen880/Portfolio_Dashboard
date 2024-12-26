import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const AlertTypePopup = ({ open, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [alertType, setAlertType] = useState([]);
  const [triggers, setTriggers] = useState([]);

  const [riskThreshold, setRiskThreshold] = useState("");
  const [sharpeImprovement, setSharpeImprovement] = useState("");
  const [momentum, setMomentum] = useState("");

  const handleNext = () => setStep((prevStep) => prevStep + 1);
  const handleBack = () => setStep((prevStep) => prevStep - 1);
  const handleFinish = () => {
    onSubmit({
      alertType,
      triggers,
      riskThreshold,
      sharpeImprovement,
      momentum,
    });
    onClose();
  };

  const handleAlertTypeChange = (type) => {
    setAlertType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleTriggerChange = (trigger) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {step === 1 ? "Select Alert Types" : "Set Triggering Conditions"}
      </DialogTitle>
      <DialogContent>
        {step === 1 && (
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertType.includes("Email")}
                  onChange={() => handleAlertTypeChange("Email")}
                />
              }
              label="Email"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertType.includes("SMS")}
                  onChange={() => handleAlertTypeChange("SMS")}
                />
              }
              label="SMS"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertType.includes("Push Notification")}
                  onChange={() => handleAlertTypeChange("Push Notification")}
                />
              }
              label="Push Notification"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertType.includes("In-Website Notification")}
                  onChange={() =>
                    handleAlertTypeChange("In-Website Notification")
                  }
                />
              }
              label="In-Website Notification"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={triggers.includes("Risk")}
                  onChange={() => handleTriggerChange("Risk")}
                />
              }
              label="Risk"
            />
            {triggers.includes("Risk") && (
              <TextField
                label="Risk Threshold (%)"
                type="number"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(e.target.value)}
                fullWidth
                margin="normal"
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={triggers.includes("Sharpe")}
                  onChange={() => handleTriggerChange("Sharpe")}
                />
              }
              label="Sharpe"
            />
            {triggers.includes("Sharpe") && (
              <TextField
                label="Sharpe Ratio Improvement (%)"
                type="number"
                value={sharpeImprovement}
                onChange={(e) => setSharpeImprovement(e.target.value)}
                fullWidth
                margin="normal"
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={triggers.includes("Momentum")}
                  onChange={() => handleTriggerChange("Momentum")}
                />
              }
              label="Momentum"
            />
            {triggers.includes("Momentum") && (
              <>
                <TextField
                  label="Momentum Threshold (%)"
                  type="number"
                  value={momentum}
                  onChange={(e) => setMomentum(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </>
            )}
          </div>
        )}
      </DialogContent>

      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {step > 1 && <Button onClick={handleBack}>Back</Button>}
        {step < 2 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleFinish}>Submit</Button>
        )}
      </div>
    </Dialog>
  );
};

export default AlertTypePopup;
