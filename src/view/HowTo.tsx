import Card from 'react-bootstrap/Card';
import { Trans, useTranslation } from 'react-i18next';
import '../i18n';

export function HowTo() {
  const { t } = useTranslation();

  return (
    <Card id="explanation-card" border="primary" style={{ maxWidth: '600px' }}>
      <Card.Header as="h5">🤔 {t('explanation.header')}</Card.Header>
      <Card.Body>
        <Card.Text>
          <Trans i18nKey="explanation.text" />
        </Card.Text>
        <Card.Link href="https://github.com/luth1um/ttr-calculator" target="_blank">
          {t('explanation.link-sources')}
        </Card.Link>
      </Card.Body>
    </Card>
  );
}
