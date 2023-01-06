import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function App() {
  return (
    <div>
      <h1>🏓 TTR Calculator</h1>
      <Card border="primary" style={{ maxWidth: '400px' }}>
        <Card.Header as="h5">🤔 How To</Card.Header>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            Some text.
          </Card.Text>
        </Card.Body>
      </Card>
      <Button variant="primary">Primary</Button>
    </div>
  );
}

export default App;
