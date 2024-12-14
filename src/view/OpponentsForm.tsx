import React, { JSX, useCallback } from 'react';
import { Button, Card, FloatingLabel, Form, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
  CalculatorFormState,
  CalculatorFormViewModel,
  CalculatorParaNames,
  MAX_TTR,
  MIN_TTR,
} from '../viewmodel/CalculatorFormViewModel';

interface OpponentsFormProps {
  viewModel: CalculatorFormViewModel;
}

export const OpponentsForm: React.FC<OpponentsFormProps> = (props) => {
  const { viewModel } = props;
  const { t } = useTranslation();
  const {
    state,
    opponents,
    allInputsValid,
    updateCalculatorParams,
    submitCalculatorForm,
    resetCalculatorForm,
    addOpponent,
    removeOpponent,
  } = viewModel;

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, checked, value } = event.currentTarget;
      const newValue = type === 'checkbox' ? checked : value;
      updateCalculatorParams(viewModel, name, newValue);
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

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const formatOpponentForms = useCallback((): JSX.Element[] => {
    const opponentForms: JSX.Element[] = [];
    for (let i = 0; i < opponents.length; i++) {
      const { opponentTTRating, gameWasWon } = opponents[i];
      const numberString = opponents.length > 1 ? ' ' + (i + 1) : '';
      opponentForms.push(
        <ListGroup.Item key={'opponent' + i}>
          <Card.Subtitle>{t('calculator-form.opponents.opponent-subtitle') + numberString}</Card.Subtitle>
          <Card.Body>
            <Form.Group className="mb-3" controlId={'gameWon' + i}>
              <Form.Check
                type="checkbox"
                disabled={state !== CalculatorFormState.READY}
                label={t('calculator-form.opponents.game-won')}
                name={CalculatorParaNames.GAME_WON + i}
                onChange={handleInputChange}
                checked={gameWasWon}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={'ttrOpponent' + i}>
              <FloatingLabel controlId="inputTTROpponent" label={t('calculator-form.ttr')} className="mb-3">
                <Form.Control
                  type="number"
                  disabled={state !== CalculatorFormState.READY}
                  placeholder={t('calculator-form.ttr') ?? undefined}
                  name={CalculatorParaNames.TTR_OPPONENT + i}
                  value={opponentTTRating !== 0 ? opponentTTRating : ''}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  isInvalid={opponentTTRating < MIN_TTR || opponentTTRating > MAX_TTR}
                />
                <Form.Control.Feedback type="invalid">
                  {t('calculator-form.invalid.opponent-ttr', { number: i + 1 })}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Form.Group>
          </Card.Body>
        </ListGroup.Item>
      );
    }
    return opponentForms;
  }, [state, opponents, handleInputChange, t, handleFocus]);

  return (
    <Card id="opponents-form" border="primary" style={{ maxWidth: '600px' }}>
      <Card.Header as="h5">{t('calculator-form.opponents.title')}</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>{t('calculator-form.opponents.text')}</ListGroup.Item>
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
          disabled={state !== CalculatorFormState.READY || !allInputsValid}
          variant="primary"
          type="submit"
          onClick={handleSubmit}
        >
          {t('calculator-form.buttons.submit')}
        </Button>
        <Button
          className="me-2"
          disabled={state !== CalculatorFormState.READY}
          variant="danger"
          type="reset"
          onClick={handleReset}
        >
          {t('calculator-form.buttons.reset')}
        </Button>
      </Card.Body>
    </Card>
  );
};
