import { useQuery, UseQueryOptions } from 'react-query';
import { BigNumberish, ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import {
	CRYPTO_CURRENCY_MAP,
	iStandardSynth,
	synthToAsset,
} from '@synthetixio/queries/build/node/src/currency';

import Connector from 'containers/Connector';
import { networkState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { Rates } from './types';
import ROUTES from 'constants/routes';

type CurrencyRate = BigNumberish;
type SynthRatesTuple = [string[], CurrencyRate[]];

// Additional commonly used currencies to fetch, besides the one returned by the SynthUtil.synthsRates
const additionalCurrencies = [CRYPTO_CURRENCY_MAP.SNX, 'XAU', 'XAG', 'DYDX', 'APE'].map(
	ethers.utils.formatBytes32String
);

const useExchangeRatesQuery = (options?: UseQueryOptions<Rates>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs: snxjs, defaultSynthetixjs } = Connector.useContainer();
	const synthetixjs = window.location.pathname === ROUTES.Home.Root ? defaultSynthetixjs : snxjs;

	return useQuery<Rates>(
		['rates', 'exchangeRates2', network.id],
		async () => {
			const exchangeRates: Rates = {};

			const [synthsRates, ratesForCurrencies] = (await Promise.all([
				synthetixjs!.contracts.SynthUtil.synthsRates(),
				synthetixjs!.contracts.ExchangeRates.ratesForCurrencies(additionalCurrencies),
			])) as [SynthRatesTuple, CurrencyRate[]];

			const synths = [...synthsRates[0], ...additionalCurrencies] as CurrencyKey[];
			const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

			synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
				const currencyKey = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
				const rate = Number(ethers.utils.formatEther(rates[idx]));

				exchangeRates[currencyKey] = wei(rate);
				// only interested in the standard synths (sETH -> ETH, etc)
				if (iStandardSynth(currencyKey)) {
					exchangeRates[synthToAsset(currencyKey)] = wei(rate);
				}
			});

			return exchangeRates;
		},
		{
			enabled: isAppReady && !!synthetixjs,
			refetchInterval: 60000,
			...options,
		}
	);
};

export default useExchangeRatesQuery;
