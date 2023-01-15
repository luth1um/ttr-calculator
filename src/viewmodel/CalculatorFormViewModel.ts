import { useCallback, useEffect, useState } from 'react';
import { TTGame, TTPlayer } from 'ttr-calculator-typescript';

export interface CalculatorFormViewModel {
  state: CalculatorFormState;
  player: TTPlayer;
  opponents: TTGame[];

  updateCalculatorParams: (viewModel: CalculatorFormViewModel, name?: string, value?: string) => void;
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

export function useCalculatorFormViewModel(): CalculatorFormViewModel {
  const updateCalculatorParams = useCallback((viewModel: CalculatorFormViewModel, name?: string, value?: string) => {
    if (!name) {
      console.log('Undefined parameter name');
      return;
    }
    const { state, player, opponents } = viewModel;
    if (state !== CalculatorFormState.READY) {
      return;
    }

    let updatedPlayer = { ...player };
    let updatedOpponents = [...opponents];

    if (name === CalculatorParaNames.TTR_PLAYER) {
      const ttr = value ? parseInt(value) : 0;
      updatedPlayer = { ...updatedPlayer, ttRating: ttr };
      console.log('TTR player: ', ttr); // TODO: remove line
    }

    if (name === CalculatorParaNames.YOUNGER_THAN_21) {
      const isYoungerThan21 = value === 'true' ? true : false;
      updatedPlayer = { ...updatedPlayer, isYoungerThan21: isYoungerThan21 };
      console.log('Is player younger than 21? ', isYoungerThan21); // TODO: remove line
    }

    if (name === CalculatorParaNames.YOUNGER_THAN_16) {
      const isYoungerThan16 = value === 'true' ? true : false;
      updatedPlayer = { ...updatedPlayer, isYoungerThan16: isYoungerThan16 };
      console.log('Is player younger than 16? ', isYoungerThan16); // TODO: remove line
    }

    if (name === CalculatorParaNames.LESS_THAN_30_GAMES) {
      const hasLessThan30Games = value === 'true' ? true : false;
      updatedPlayer = { ...updatedPlayer, lessThan30SingleGames: hasLessThan30Games };
      console.log('Does the player have less than 30 games overall? ', hasLessThan30Games); // TODO: remove line
    }

    if (name === CalculatorParaNames.YEAR_BREAK_15_GAMES) {
      const hasLessThan15GamesAfterYearBreak = value === 'true' ? true : false;
      updatedPlayer = {
        ...updatedPlayer,
        lessThan15SingleGamesOverallOrAfterYearBreak: hasLessThan15GamesAfterYearBreak,
      };
      console.log(
        'Does the player have less than 15 games after a break of at least one year? ',
        hasLessThan15GamesAfterYearBreak
      ); // TODO: remove line
    }

    if (name.startsWith(CalculatorParaNames.GAME_WON)) {
      const opponentNumberString = name.substring(CalculatorParaNames.GAME_WON.length);
      const opponentNumber = parseInt(opponentNumberString);
      const gameWon = value === 'true' ? true : false;
      updatedOpponents[opponentNumber] = { ...updatedOpponents[opponentNumber], gameWasWon: gameWon };
      console.log('Game won against opponent ' + opponentNumber + '? ', gameWon); // TODO: remove line
    }

    if (name.startsWith(CalculatorParaNames.TTR_OPPONENT)) {
      const opponentNumberString = name.substring(CalculatorParaNames.TTR_OPPONENT.length);
      const opponentNumber = parseInt(opponentNumberString);
      const ttr = value ? parseInt(value) : 0;
      updatedOpponents[opponentNumber] = { ...updatedOpponents[opponentNumber], opponentTTRating: ttr };
      console.log('TTR opponent ' + opponentNumber + ': ', ttr); // TODO: remove line
    }

    setViewModel({ ...viewModel, player: updatedPlayer, opponents: updatedOpponents });
  }, []);

  const submitCalculatorForm = useCallback((viewModel: CalculatorFormViewModel) => {
    setViewModel({ ...viewModel, state: CalculatorFormState.CALCULATING });
  }, []);

  const resetCalculatorForm = useCallback((viewModel: CalculatorFormViewModel) => {
    setViewModel({ ...viewModel, state: CalculatorFormState.RESET });
  }, []);

  const addOpponent = useCallback((viewModel: CalculatorFormViewModel, opponents: TTGame[]) => {
    const updatedOpponents = [...opponents, { opponentTTRating: 1000, gameWasWon: false }];
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
    opponents: [{ opponentTTRating: 1000, gameWasWon: false }],
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
      // TODO: also check validity before calculating
      // TODO: calculate and do stuff
      console.log('Some pretty cool calculation stuff is happening...');
      setViewModel({ ...viewModel, state: CalculatorFormState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.RESET) {
      setViewModel({
        ...viewModel,
        state: CalculatorFormState.READY,
        player: { ttRating: 1000 },
        opponents: [{ opponentTTRating: 1000, gameWasWon: false }],
      });
    }
  }, [viewModel]);

  // ===================================================================================================================

  return viewModel;
}
