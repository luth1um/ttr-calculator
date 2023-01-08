import { useCallback, useEffect, useState } from 'react';
import { Opponent } from './model/Opponent';
import { Player } from './model/Player';

export interface CalculatorFormViewModel {
  state: CalculatorFormState;
  player: Player;
  opponents: Opponent[];

  updateCalculatorParams: (viewModel: CalculatorFormViewModel, name?: string, value?: string) => void;
  resetCalculatorForm: (viewModel: CalculatorFormViewModel) => void;
  addOpponent: (viewModel: CalculatorFormViewModel, opponents: Opponent[]) => void;
  removeOpponent: (viewModel: CalculatorFormViewModel, opponents: Opponent[]) => void;
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
  GAME_WON = 'GAME_WON',
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

    if (name.startsWith(CalculatorParaNames.TTR_OPPONENT)) {
      const opponentNumberString = name.substring(CalculatorParaNames.TTR_OPPONENT.length);
      const opponentNumber = parseInt(opponentNumberString);
      opponents[opponentNumber].ttr = value ? parseInt(value) : undefined;
      setViewModel({ ...viewModel, opponents: opponents });
    }

    // TODO: update remaining fields
  }, []);

  const resetCalculatorForm = useCallback((viewModel: CalculatorFormViewModel) => {
    setViewModel({ ...viewModel, state: CalculatorFormState.RESET, player: {}, opponents: [{}] });
  }, []);

  const addOpponent = useCallback((viewModel: CalculatorFormViewModel, opponents: Opponent[]) => {
    opponents.push({ gameWon: false });
    setViewModel({ ...viewModel, opponents: opponents });
  }, []);

  const removeOpponent = useCallback((viewModel: CalculatorFormViewModel, opponents: Opponent[]) => {
    if (opponents.length <= 1) {
      return;
    }
    opponents.pop();
    setViewModel({ ...viewModel, opponents: opponents });
  }, []);

  const [viewModel, setViewModel] = useState<CalculatorFormViewModel>({
    state: CalculatorFormState.INIT,
    player: {},
    opponents: [{ gameWon: false }],
    updateCalculatorParams,
    resetCalculatorForm,
    addOpponent,
    removeOpponent,
  });

  // ===================================================================================================================

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.INIT) {
      // just set the state to READY at the moment
      setViewModel({ ...viewModel, state: CalculatorFormState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === CalculatorFormState.RESET) {
      // just set the state to READY at the moment
      setViewModel({ ...viewModel, state: CalculatorFormState.READY });
    }
  }, [viewModel]);

  // ===================================================================================================================

  return viewModel;
}
