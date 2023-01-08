import { Button, Form, ListGroup } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";

export function CalculatorForm() {
  const { t } = useTranslation();

  const forms: JSX.Element[] = [];
  // TODO: save number of opponents in state
  for (let i = 0; i < 3; i++) {
    const numberString = " " + (i + 1);
    forms.push(
      <ListGroup.Item key={"opponent" + i}>
        <Card.Subtitle>{t("calculator-form.opponents.opponent-subtitle") + numberString}</Card.Subtitle>
        <Card.Body>
          <Form.Group className="mb-3" controlId={"gameWon" + i}>
            <Form.Check type="checkbox" label={t("calculator-form.opponents.game-won")} />
          </Form.Group>
          <Form.Group className="mb-3" controlId={"ttrOpponent" + i}>
            <Form.Label hidden={true}>{t("calculator-form.ttr")}</Form.Label>
            <Form.Control type="number" placeholder={t("calculator-form.ttr") ?? undefined} />
          </Form.Group>
        </Card.Body>
      </ListGroup.Item>
    );
  }

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
              <Form.Control type="number" placeholder={t("calculator-form.ttr") ?? undefined} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan21">
              <Form.Check type="checkbox" label={t("calculator-form.player.younger-than-21")} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formYoungerThan16">
              <Form.Check type="checkbox" label={t("calculator-form.player.younger-than-16")} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan30SingleGames">
              <Form.Check type="checkbox" label={t("calculator-form.player.less-than-30-singles")} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLessThan15SingleGamesAfterYearBreak">
              <Form.Check type="checkbox" label={t("calculator-form.player.year-break-less-15-singles")} />
            </Form.Group>
          </ListGroup.Item>
          <ListGroup.Item>
            <Card.Title>{t("calculator-form.opponents.title")}</Card.Title>
            <Card.Text>{t("calculator-form.opponents.text")}</Card.Text>
          </ListGroup.Item>
          {forms}
        </ListGroup>
        <Card.Body>
          <Button className="me-2" variant="primary">
            +
          </Button>
          <Button className="me-2" variant="primary">
            -
          </Button>
          <Button className="me-2" variant="primary" type="submit">
            {t("calculator-form.buttons.submit")}
          </Button>
          <Button className="me-2" variant="danger" type="reset">
            {t("calculator-form.buttons.reset")}
          </Button>
        </Card.Body>
      </Form>
    </Card>
  );
}
