import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";

export function HowTo() {
  const { t } = useTranslation();

  return (
    <Card id="explanation-card" border="primary" style={{ maxWidth: "400px" }}>
      <Card.Header as="h5">🤔 {t("explanation.header")}</Card.Header>
      <Card.Body>
        <Card.Text>{t("explanation.text")}</Card.Text>
      </Card.Body>
    </Card>
  );
}
