import React from "react";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { CalculatorForm } from "./calculator-form/CalculatorForm";
import { HowTo } from "./how-to/HowTo";

function App() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>🏓 {t("app.title")}</h1>
      <HowTo />
      <br />
      <CalculatorForm />
    </div>
  );
}

export default App;
