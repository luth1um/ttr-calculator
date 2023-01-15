import { useCallback } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";
import {
  CalculatorFormState,
  CalculatorFormViewModel,
  CalculatorParaNames,
} from "../viewmodel/CalculatorFormViewModel";

interface CalculatorFormProps {
  viewModel: CalculatorFormViewModel;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = (props) => {
  const { t } = useTranslation();
  const { viewModel } = props;
  const {
    state,
    player,
    opponents,
    updateCalculatorParams,
    submitCalculatorForm,
    resetCalculatorForm,
    addOpponent,
    removeOpponent,
  } = viewModel;

  const handleInputChange = useCallback(
    (event: any) => {
      updateCalculatorParams(viewModel, event.currentTarget.name, event.currentTarget._valueTracker.getValue());
    },
    [viewModel, updateCalculatorParams]
  );

  const handleSubmit = useCallback(() => {
    submitCalculatorForm(viewModel);
  }, [viewModel, submitCalculatorForm]);

  const handleReset = useCallback(() => {
    resetCalculatorForm(viewModel);
  }, [viewModel, resetCalculatorForm]);

  const handleAdd = useCallback(() => {
    addOpponent(viewModel, opponents);
  }, [viewModel, opponents, addOpponent]);

  const handleRemove = useCallback(() => {
    removeOpponent(viewModel, opponents);
  }, [viewModel, opponents, removeOpponent]);

  const formatOpponentForms = useCallback((): JSX.Element[] => {
    const opponentForms: JSX.Element[] = [];
    for (let i = 0; i < opponents.length; i++) {
      const { opponentTTRating } = opponents[i];
      const numberString = opponents.length > 1 ? " " + (i + 1) : "";
      opponentForms.push(
        <ListGroup.Item key={"opponent" + i}>
          <Card.Subtitle>{t("calculator-form.opponents.opponent-subtitle") + numberString}</Card.Subtitle>
          <Card.Body>
            <Form.Group className="mb-3" controlId={"gameWon" + i}>
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t("calculator-form.opponents.game-won")}
                name={CalculatorParaNames.GAME_WON + i}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={"ttrOpponent" + i}>
              <Form.Label hidden={true}>{t("calculator-form.ttr")}</Form.Label>
              <Form.Control
                type="number"
                disabled={state !== CalculatorFormState.READY}
                placeholder={t("calculator-form.ttr") ?? undefined}
                name={CalculatorParaNames.TTR_OPPONENT + i}
                value={opponentTTRating !== 0 ? opponentTTRating : ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Card.Body>
        </ListGroup.Item>
      );
    }
    return opponentForms;
  }, [state, opponents, handleInputChange, t]);

  return (
    <Card id="calculator-form" border="primary" style={{ maxWidth: "400px" }}>
      <Form>
        <Card.Header as="h5">🧮 {t("calculator-form.header")}</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Card.Title>{t("calculator-form.player.title")}</Card.Title>
            <Card.Text>{t("calculator-form.player.text")}</Card.Text>
            <Form.Group className="mb-3" controlId="formTtrPlayer">
              <Form.Label hidden={true}>{t("calculator-form.ttr")}</Form.Label>
              <Form.Control
                type="number"
                disabled={state !== CalculatorFormState.READY}
                placeholder={t("calculator-form.ttr") ?? undefined}
                name={CalculatorParaNames.TTR_PLAYER}
                value={player.ttRating !== 0 ? player.ttRating : ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan21">
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t("calculator-form.player.younger-than-21")}
                name={CalculatorParaNames.YOUNGER_THAN_21}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan16">
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t("calculator-form.player.younger-than-16")}
                name={CalculatorParaNames.YOUNGER_THAN_16}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan30SingleGames">
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t("calculator-form.player.less-than-30-singles")}
                name={CalculatorParaNames.LESS_THAN_30_GAMES}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan15SingleGamesAfterYearBreak">
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t("calculator-form.player.year-break-less-15-singles")}
                name={CalculatorParaNames.YEAR_BREAK_15_GAMES}
                onChange={handleInputChange}
              />
            </Form.Group>
          </ListGroup.Item>
          <ListGroup.Item>
            <Card.Title>{t("calculator-form.opponents.title")}</Card.Title>
            <Card.Text>{t("calculator-form.opponents.text")}</Card.Text>
          </ListGroup.Item>
          {formatOpponentForms()}
        </ListGroup>
        <Card.Body>
          <Button
            className="me-2"
            disabled={state !== CalculatorFormState.READY}
            variant="primary"
            type="button"
            onClick={handleAdd}
          >
            +
          </Button>
          <Button
            className="me-2"
            disabled={state !== CalculatorFormState.READY || opponents.length <= 1}
            variant="primary"
            type="button"
            onClick={handleRemove}
          >
            -
          </Button>
          <Button
            className="me-2"
            disabled={state !== CalculatorFormState.READY}
            variant="primary"
            type="submit"
            onClick={handleSubmit}
          >
            {t("calculator-form.buttons.submit")}
          </Button>
          <Button
            className="me-2"
            disabled={state !== CalculatorFormState.READY}
            variant="danger"
            type="reset"
            onClick={handleReset}
          >
            {t("calculator-form.buttons.reset")}
          </Button>
        </Card.Body>
      </Form>
    </Card>
  );
};
