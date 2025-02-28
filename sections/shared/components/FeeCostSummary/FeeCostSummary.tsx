import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Wei from '@synthetixio/wei';

import { formatCurrency } from 'utils/formatters/number';

import { NO_VALUE } from 'constants/placeholder';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import { CurrencyKey } from 'constants/currency';

type FeeRateSummaryItemProps = {
	feeCost: Wei | null;
};

const FeeCostSummary: FC<FeeRateSummaryItemProps> = ({ feeCost, ...rest }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>{t('common.summary.fee-cost')}</SummaryItemLabel>
			<SummaryItemValue data-testid="exchange-fee-cost">
				{feeCost != null
					? formatCurrency(selectedPriceCurrency.name as CurrencyKey, feeCost, {
							sign: selectedPriceCurrency.sign,
							minDecimals: feeCost.lt(0.01) ? 4 : 2,
					  })
					: NO_VALUE}
			</SummaryItemValue>
		</SummaryItem>
	);
};

export default FeeCostSummary;
