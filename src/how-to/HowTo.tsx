import Card from "react-bootstrap/Card";

export function HowTo() {
  return (
    <Card id="how-to-card" border="primary" style={{ maxWidth: "400px" }}>
      <Card.Header as="h5">🤔 How To</Card.Header>
      <Card.Body>
        <Card.Text>Some text.</Card.Text>
      </Card.Body>
    </Card>
  );
}
