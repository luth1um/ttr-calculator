import React from "react";
import { useTranslation } from "react-i18next";
import { useCalculatorFormViewModel } from "./viewmodel/CalculatorFormViewModel";
import { CalculatorForm } from "./view/CalculatorForm";
import { HowTo } from "./view/HowTo";

function App() {
  const { t } = useTranslation();
  const calculatorFormViewModel = useCalculatorFormViewModel();

  return (
    <div>
      <h1>🏓 {t("app.title")}</h1>
      <HowTo />
      <br />
      <CalculatorForm viewModel={calculatorFormViewModel} />
    </div>
  );
}

export default App;
