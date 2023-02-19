import { useCallback, useMemo } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { CalculatorFormViewModel } from "../viewmodel/CalculatorFormViewModel";

interface ResultProps {
  viewModel: CalculatorFormViewModel;
}

export const Result: React.FC<ResultProps> = (props) => {
  const { viewModel } = props;
  const { t } = useTranslation();
  const { calculationResult } = viewModel;

  const roundTo3DecimalPlaces = useCallback((numberToRound: number): number => {
    return Math.round(numberToRound * 1000) / 1000;
  }, []);

  const resultContent: JSX.Element = useMemo(() => {
    if (!calculationResult) {
      return (
        <ListGroup.Item>
          <Trans i18nKey="result.initially-no-result" />
        </ListGroup.Item>
      );
    }

    const opponentDetails: JSX.Element[] = [];
    const winExpectations = calculationResult.winExpectations;
    if (winExpectations.length > 1) {
      for (let i = 0; i < winExpectations.length; i++) {
        opponentDetails.push(
          <li key={"expectionOpponent" + i}>
            {t("result.expectation-opponent", {
              number: i + 1,
              expectation: roundTo3DecimalPlaces(winExpectations[i]),
            })}
          </li>
        );
      }
    }

    return (
      <ListGroup.Item>
        <ul>
          <li key="ttrUpdated">{t("result.ttr-updated", { value: calculationResult.updatedRating })}</li>
          <li key="ttrChange">{t("result.ttr-change", { count: calculationResult.ratingChange })}</li>
          <li key="winningExpectation">
            {t("result.winning-expectation", {
              count: roundTo3DecimalPlaces(calculationResult.expectedNumberWins),
            })}
          </li>
          {opponentDetails}
        </ul>
      </ListGroup.Item>
    );
  }, [calculationResult, t, roundTo3DecimalPlaces]);

  return (
    <Card id="results" border="primary" style={{ maxWidth: "600px" }}>
      <Card.Header as="h5">{t("result.title")}</Card.Header>
      <ListGroup variant="flush">{resultContent}</ListGroup>
    </Card>
  );
};
