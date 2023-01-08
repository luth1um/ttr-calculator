import React from "react";
import { useTranslation } from "react-i18next";
import { CalculatorForm } from "./view/CalculatorForm";
import { HowTo } from "./view/HowTo";

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
