import React from "react";
import { useTranslation } from "react-i18next";
import { useCalculatorFormViewModel } from "./viewmodel/CalculatorFormViewModel";
import { HowTo } from "./view/HowTo";
import { Form } from "react-bootstrap";
import { PlayerForm } from "./view/PlayerForm";
import { OpponentsForm } from "./view/OpponentsForm";

function App() {
  const { t } = useTranslation();
  const calculatorFormViewModel = useCalculatorFormViewModel();

  return (
    <div>
      <h1>🏓 {t("app.title")}</h1>
      <HowTo />
      <br />
      <Form>
        <PlayerForm viewModel={calculatorFormViewModel} />
        <br />
        <OpponentsForm viewModel={calculatorFormViewModel} />
      </Form>
    </div>
  );
}

export default App;
