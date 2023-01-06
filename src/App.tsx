import React from "react";
import Button from "react-bootstrap/Button";
import { HowTo } from "./how-to/HowTo";

function doNothing(): void {
  console.log("button clicked");
}

function App() {
  return (
    <div>
      <h1>🏓 TTR Calculator</h1>
      <HowTo />
      <Button variant="primary" onClick={() => doNothing()}>
        Primary
      </Button>
    </div>
  );
}

export default App;
