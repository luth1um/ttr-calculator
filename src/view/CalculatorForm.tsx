import { Button, Form, ListGroup } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";
import { CalculatorFormState, CalculatorFormViewModel, CalculatorParaNames } from "../CalculatorFormViewModel";

interface CalculatorFormProps {
  viewModel: CalculatorFormViewModel;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = (props) => {
  const { t } = useTranslation();
  const { viewModel } = props;
  const { player, opponents } = viewModel;

  const handleInputChange = (event: any) => {
    const blub = event.currentTarget.value;
    viewModel.updateCalculatorParams(viewModel, event.currentTarget.name, event.currentTarget.value);
  };

  const handleReset = () => {
    viewModel.resetCalculatorForm(viewModel);
  };

  const addOpponent = () => {
    viewModel.addOpponent(viewModel, opponents);
  };

  const removeOpponent = () => {
    viewModel.removeOpponent(viewModel, opponents);
  };

  const formatOpponentForms = (): JSX.Element[] => {
    const opponentForms: JSX.Element[] = [];
    for (let i = 0; i < opponents.length; i++) {
      const ttrOpponent = opponents[i].ttr;
      const numberString = opponents.length > 1 ? " " + (i + 1) : "";
      opponentForms.push(
        <ListGroup.Item key={"opponent" + i}>
          <Card.Subtitle>{t("calculator-form.opponents.opponent-subtitle") + numberString}</Card.Subtitle>
          <Card.Body>
            <Form.Group className="mb-3" controlId={"gameWon" + i}>
              <Form.Check
                type="checkbox"
                disabled={viewModel.state !== CalculatorFormState.READY}
                label={t("calculator-form.opponents.game-won")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={"ttrOpponent" + i}>
              <Form.Label hidden={true}>{t("calculator-form.ttr")}</Form.Label>
              <Form.Control
                type="number"
                disabled={viewModel.state !== CalculatorFormState.READY}
                placeholder={t("calculator-form.ttr") ?? undefined}
                name={CalculatorParaNames.TTR_OPPONENT + i}
                value={ttrOpponent}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Card.Body>
        </ListGroup.Item>
      );
    }
    return opponentForms;
  };

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
                disabled={viewModel.state !== CalculatorFormState.READY}
                placeholder={t("calculator-form.ttr") ?? undefined}
                name={CalculatorParaNames.TTR_PLAYER}
                value={player.ttr}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan21">
              <Form.Check
                type="checkbox"
                disabled={viewModel.state !== CalculatorFormState.READY}
                label={t("calculator-form.player.younger-than-21")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan16">
              <Form.Check
                type="checkbox"
                disabled={viewModel.state !== CalculatorFormState.READY}
                label={t("calculator-form.player.younger-than-16")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan30SingleGames">
              <Form.Check
                type="checkbox"
                disabled={viewModel.state !== CalculatorFormState.READY}
                label={t("calculator-form.player.less-than-30-singles")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan15SingleGamesAfterYearBreak">
              <Form.Check
                type="checkbox"
                disabled={viewModel.state !== CalculatorFormState.READY}
                label={t("calculator-form.player.year-break-less-15-singles")}
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
            disabled={viewModel.state !== CalculatorFormState.READY}
            variant="primary"
            onClick={addOpponent}
          >
            +
          </Button>
          <Button
            className="me-2"
            disabled={viewModel.state !== CalculatorFormState.READY || opponents.length <= 1}
            variant="primary"
            onClick={removeOpponent}
          >
            -
          </Button>
          <Button
            className="me-2"
            disabled={viewModel.state !== CalculatorFormState.READY}
            variant="primary"
            type="submit"
          >
            {t("calculator-form.buttons.submit")}
          </Button>
          <Button
            className="me-2"
            disabled={viewModel.state !== CalculatorFormState.READY}
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
