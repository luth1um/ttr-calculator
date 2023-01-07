import { ListGroup } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";

export function CalculatorForm() {
  const { t } = useTranslation();

  const forms: JSX.Element[] = [];
  // TODO: save number of opponents in state
  for (let i = 0; i < 3; i++) {
    forms.push(
      <ListGroup.Item key={"opponent" + i}>
        <Card.Subtitle>{t("calculator-form.opponents.opponent-subtitle") + " " + (i + 1)}</Card.Subtitle>
      </ListGroup.Item>
    );
  }

  return (
    <Card id="calculator-form" border="primary" style={{ maxWidth: "400px" }}>
      <Card.Header as="h5">🧮 {t("calculator-form.header")}</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <Card.Title>{t("calculator-form.player.title")}</Card.Title>
          <Card.Text>{t("calculator-form.player.text")}</Card.Text>
        </ListGroup.Item>
        <ListGroup.Item>
          <Card.Title>{t("calculator-form.opponents.title")}</Card.Title>
          <Card.Text>{t("calculator-form.opponents.text")}</Card.Text>
        </ListGroup.Item>
        {forms}
      </ListGroup>
    </Card>
  );
}
