import { useCallback, useEffect, useState } from 'react';
import { TTGame, TTPlayer, TTRCalculationResult, calculateTTRatingMultipeOpponents } from 'ttr-calculator-typescript';

export interface CalculatorFormViewModel {
  state: CalculatorFormState;
  player: TTPlayer;
  opponents: TTGame[];
  allInputsValid: boolean;
  calculationResult?: TTRCalculationResult;

  updateCalculatorParams: (viewModel: CalculatorFormViewModel, name?: string, value?: string | boolean) => void;
  submitCalculatorForm: (viewModel: CalculatorFormViewModel) => void;
  resetCalculatorForm: (viewModel: CalculatorFormViewModel) => void;
  addOpponent: (viewModel: CalculatorFormViewModel, opponents: TTGame[]) => void;
  removeOpponent: (viewModel: CalculatorFormViewModel, opponents: TTGame[]) => void;
}

export enum CalculatorFormState {
  INIT = 'INIT',
  CALCULATING = 'CALCULATING',
  READY = 'READY',
  RESET = 'RESET',
}

export enum CalculatorParaNames {
  TTR_PLAYER = 'TTR_PLAYER',
  YOUNGER_THAN_21 = 'YOUNGER_THAN_21',
  YOUNGER_THAN_16 = 'YOUNGER_THAN_16',
  LESS_THAN_30_GAMES = 'LESS_THAN_30_GAMES',
  YEAR_BREAK_15_GAMES = 'YEAR_BREAK_15_GAMES',
  TTR_OPPONENT = 'TTR_OPPONENT_',
  GAME_WON = 'GAME_WON_',
}

export const MIN_TTR = 1;
export const MAX_TTR = 3500;

export function useCalculatorFormViewModel(): CalculatorFormViewModel {
  const updateCalculatorParams = useCallback(
    (viewModel: CalculatorFormViewModel, name?: string, value?: string | boolean) => {
      if (!name) {
        console.log('Undefined parameter name');
        return;
      }
      const { state, player, opponents } = viewModel;
      if (state !== CalculatorFormState.READY) {
        return;
      }

      let updatedPlayer = { ...player };
      const updatedOpponents = [...opponents];

      // =================================================================================================================
      // update inputs

      if (name === CalculatorParaNames.TTR_PLAYER && typeof value === 'string') {
        const ttr = value ? parseInt(value) : 0;
        updatedPlayer = { ...updatedPlayer, ttRating: ttr };
      }

      if (name === CalculatorParaNames.YOUNGER_THAN_21 && typeof value === 'boolean') {
        updatedPlayer = { ...updatedPlayer, isYoungerThan21: value };
      }

      if (name === CalculatorParaNames.YOUNGER_THAN_16 && typeof value === 'boolean') {
        updatedPlayer = { ...updatedPlayer, isYoungerThan16: value };
      }

      if (name === CalculatorParaNames.LESS_THAN_30_GAMES && typeof value === 'boolean') {
        updatedPlayer = { ...updatedPlayer, lessThan30SingleGames: value };
      }

      if (name === CalculatorParaNames.YEAR_BREAK_15_GAMES && typeof value === 'boolean') {
        updatedPlayer = {
          ...updatedPlayer,
          lessThan15SingleGamesOverallOrAfterYearBreak: value,
        };
      }

      if (name.startsWith(CalculatorParaNames.GAME_WON) && typeof value === 'boolean') {
        const opponentNumberString = name.substring(CalculatorParaNames.GAME_WON.length);
        const opponentNumber = parseInt(opponentNumberString);
        updatedOpponents[opponentNumber] = { ...updatedOpponents[opponentNumber], gameWasWon: value };
      }

      if (name.startsWith(CalculatorParaNames.TTR_OPPONENT) && typeof value === 'string') {
        const opponentNumberString = name.substring(CalculatorParaNames.TTR_OPPONENT.length);
        const opponentNumber = parseInt(opponentNumberString);
        const ttr = value ? parseInt(value) : 0;
        updatedOpponents[opponentNumber] = { ...updatedOpponents[opponentNumber], opponentTTRating: ttr };
      }

      // =================================================================================================================
      // update validity of inputs

      const playerValid = updatedPlayer.ttRating >= MIN_TTR && updatedPlayer.ttRating <= MAX_TTR;
      const opponentsValid = updatedOpponents
        .map((opponent) => opponent.opponentTTRating)
        .reduce((validAll, ttr) => validAll && ttr >= MIN_TTR && ttr <= MAX_TTR, true);
      const updatedAllInputsValid = playerValid && opponentsValid;

      // =================================================================================================================
      // update view model

      // eslint-disable-next-line react-hooks/immutability
      setViewModel({
        ...viewModel,
        player: updatedPlayer,
        opponents: updatedOpponents,
        allInputsValid: updatedAllInputsValid,
      });
    },
    []
  );

  const submitCalculatorForm = useCallback((viewModel: CalculatorFormViewModel) => {
    setViewModel({ ...viewModel, state: CalculatorFormState.CALCULATING });
  }, []);

  const resetCalculatorForm = useCallback((viewModel: CalculatorFormViewModel) => {
    setViewModel({ ...viewModel, state: CalculatorFormState.RESET });
  }, []);

  const addOpponent = useCallback((viewModel: CalculatorFormViewModel, opponents: TTGame[]) => {
    const updatedOpponents = [...opponents, { opponentTTRating: 1000, gameWasWon: true }];
    setViewModel({ ...viewModel, opponents: updatedOpponents });
  }, []);

  const removeOpponent = useCallback((viewModel: CalculatorFormViewModel, opponents: TTGame[]) => {
    if (opponents.length <= 1) {
      return;
    }
    const updatedOpponents = [...opponents];
    updatedOpponents.pop();
    setViewModel({ ...viewModel, opponents: updatedOpponents });
  }, []);

  const [viewModel, setViewModel] = useState<CalculatorFormViewModel>({
    state: CalculatorFormState.INIT,
    player: { ttRating: 1000 },
    opponents: [{ opponentTTRating: 1000, gameWasWon: true }],
    allInputsValid: true,
    calculationResult: undefined,
    updateCalculatorParams: updateCalculatorParams,
    submitCalculatorForm: submitCalculatorForm,
    resetCalculatorForm: resetCalculatorForm,
    addOpponent: addOpponent,
    removeOpponent: removeOpponent,
  });

  // ===================================================================================================================

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.INIT) {
      // just set the state to READY at the moment
      setViewModel({ ...viewModel, state: CalculatorFormState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.CALCULATING) {
      // make sure that a player being younger than 16 is also marked
      // as being younger than 21 to obtain the correct result
      let player: TTPlayer;
      if (viewModel.player.isYoungerThan16) {
        player = { ...viewModel.player, isYoungerThan21: true };
      } else {
        player = { ...viewModel.player };
      }

      const result = calculateTTRatingMultipeOpponents(player, viewModel.opponents);
      setViewModel({ ...viewModel, state: CalculatorFormState.READY, calculationResult: result });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.RESET) {
      setViewModel({
        ...viewModel,
        state: CalculatorFormState.READY,
        player: { ttRating: 1000 },
        opponents: [{ opponentTTRating: 1000, gameWasWon: true }],
        allInputsValid: true,
        calculationResult: undefined,
      });
    }
  }, [viewModel]);

  // ===================================================================================================================

  return viewModel;
}
