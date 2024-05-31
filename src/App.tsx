import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { HowTo } from './view/HowTo';
import { OpponentsForm } from './view/OpponentsForm';
import { PlayerForm } from './view/PlayerForm';
import { Result } from './view/Result';
import { useCalculatorFormViewModel } from './viewmodel/CalculatorFormViewModel';

function App() {
  const { t } = useTranslation();
  const calculatorFormViewModel = useCalculatorFormViewModel();

  return (
    <div>
      <h1>🏓 {t('app.title')}</h1>
      <HowTo />
      <br />
      <Form>
        <PlayerForm viewModel={calculatorFormViewModel} />
        <br />
        <OpponentsForm viewModel={calculatorFormViewModel} />
      </Form>
      <br />
      <Result viewModel={calculatorFormViewModel} />
    </div>
  );
}

export default App;
