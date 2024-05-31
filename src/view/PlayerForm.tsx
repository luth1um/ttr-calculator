import { useCallback } from "react";
import { Card, FloatingLabel, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  CalculatorFormState,
  CalculatorFormViewModel,
  CalculatorParaNames,
  MAX_TTR,
  MIN_TTR,
} from "../viewmodel/CalculatorFormViewModel";

interface PlayerFormProps {
  viewModel: CalculatorFormViewModel;
}

export const PlayerForm: React.FC<PlayerFormProps> = (props) => {
  const { viewModel } = props;
  const { state, player, updateCalculatorParams } = viewModel;
  const { t } = useTranslation();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, checked, value } = event.currentTarget;
      const newValue = type === "checkbox" ? checked : value;
      updateCalculatorParams(viewModel, name, newValue);
    },
    [viewModel, updateCalculatorParams]
  );

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  return (
    <Card id="player-form" border="primary" style={{ maxWidth: "600px" }}>
      <Card.Header as="h5">{t("calculator-form.player.title")}</Card.Header>
      <Card.Body>
        <Card.Text>{t("calculator-form.player.text")}</Card.Text>
        <Form.Group className="mb-3" controlId="formTtrPlayer">
          <FloatingLabel controlId="inputTTRPlayer" label={t("calculator-form.ttr")} className="mb-3">
            <Form.Control
              type="number"
              disabled={state !== CalculatorFormState.READY}
              placeholder={t("calculator-form.ttr") ?? undefined}
              name={CalculatorParaNames.TTR_PLAYER}
              value={player.ttRating !== 0 ? player.ttRating : ""}
              onChange={handleInputChange}
              onFocus={handleFocus}
              isInvalid={player.ttRating < MIN_TTR || player.ttRating > MAX_TTR}
            />
            <Form.Control.Feedback type="invalid">{t("calculator-form.invalid.player-ttr")}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formYoungerThan21">
          <Form.Check
            type="checkbox"
            disabled={state !== CalculatorFormState.READY}
            label={t("calculator-form.player.younger-than-21")}
            name={CalculatorParaNames.YOUNGER_THAN_21}
            onChange={handleInputChange}
            checked={!!player.isYoungerThan21}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formYoungerThan16">
          <Form.Check
            type="checkbox"
            disabled={state !== CalculatorFormState.READY}
            label={t("calculator-form.player.younger-than-16")}
            name={CalculatorParaNames.YOUNGER_THAN_16}
            onChange={handleInputChange}
            checked={!!player.isYoungerThan16}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formLessThan30SingleGames">
          <Form.Check
            type="checkbox"
            disabled={state !== CalculatorFormState.READY}
            label={t("calculator-form.player.less-than-30-singles")}
            name={CalculatorParaNames.LESS_THAN_30_GAMES}
            onChange={handleInputChange}
            checked={!!player.lessThan30SingleGames}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formLessThan15SingleGamesAfterYearBreak">
          <Form.Check
            type="checkbox"
            disabled={state !== CalculatorFormState.READY}
            label={t("calculator-form.player.year-break-less-15-singles")}
            name={CalculatorParaNames.YEAR_BREAK_15_GAMES}
            onChange={handleInputChange}
            checked={!!player.lessThan15SingleGamesOverallOrAfterYearBreak}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};
