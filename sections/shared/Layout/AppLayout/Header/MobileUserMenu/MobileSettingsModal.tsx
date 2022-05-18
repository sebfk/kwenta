import { FC, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Connector from 'containers/Connector';

import { isL2State } from 'store/wallet';

import FullScreenModal from 'components/FullScreenModal';
import Logo from 'sections/shared/Layout/Logo';

import MobileSubMenu from './MobileSubMenu';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { languageState, priceCurrencyState, PRICE_CURRENCIES } from 'store/app';
import { Language } from 'translations/constants';

import MobileMenuBridgeIcon from 'assets/svg/app/mobile-menu-bridge.svg';
import MobileMenuDisconnectIcon from 'assets/svg/app/mobile-menu-disconnect.svg';
import MobileSwitchToL1Icon from 'assets/svg/app/mobile-switch-to-l1.svg';
import MobileSwitchWalletIcon from 'assets/svg/app/mobile-switch-wallet.svg';
import { EXTERNAL_LINKS } from 'constants/links';

const lanugageIcons = {
	en: '🌐',
};

type MobileSettingsModalProps = {
	onDismiss(): void;
};

type SettingCategories = 'wallet' | 'network' | 'language' | 'currency';

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const [language, setLanguage] = usePersistedRecoilState(languageState);

	const languages = t('languages', { returnObjects: true }) as Record<Language, string>;

	const languageOptions = useMemo(
		() =>
			Object.entries(languages).map(([langCode, langLabel]) => ({
				value: langCode,
				label: langLabel,
			})),
		[languages]
	);

	const { connectWallet, disconnectWallet } = Connector.useContainer();
	const [expanded, setExpanded] = useState<SettingCategories>();

	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);

	const { synthsMap, network } = Connector.useContainer();

	const currencyOptions = useMemo(() => {
		if (network != null && synthsMap != null) {
			return PRICE_CURRENCIES.filter((currencyKey) => synthsMap![currencyKey]).map(
				(currencyKey) => {
					const synth = synthsMap![currencyKey]!;
					return {
						label: synth.asset,
						value: synth,
						sign: synth.sign,
					};
				}
			);
		}
		return [];
	}, [network, synthsMap]);

	const handleToggle = (category: SettingCategories) => () => {
		setExpanded((c) => (category === c ? undefined : category));
	};

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				<LogoContainer>
					<Logo isFutures isL2={isL2} />
				</LogoContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Wallet"
						onDismiss={onDismiss}
						active={expanded === 'wallet'}
						onToggle={handleToggle('wallet')}
						options={[
							{
								label: 'Switch',
								icon: <MobileSwitchWalletIcon />,
								onClick: connectWallet,
							},
							{
								label: 'Disconnect',
								icon: <MobileMenuDisconnectIcon />,
								onClick: disconnectWallet,
							},
						]}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Network"
						onDismiss={onDismiss}
						active={expanded === 'network'}
						onToggle={handleToggle('network')}
						options={[
							{
								label: 'Switch to L1',
								icon: <MobileSwitchToL1Icon />,
								onClick: () => {},
							},
							{
								label: 'Bridge ↗',
								icon: <MobileMenuBridgeIcon />,
								externalLink: EXTERNAL_LINKS.Trading.OptimismTokenBridge,
							},
						]}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Language"
						onDismiss={onDismiss}
						active={expanded === 'language'}
						onToggle={handleToggle('language')}
						options={languageOptions.map((option) => ({
							label: option.label,
							icon: <div>{lanugageIcons[option.value as Language]}</div>,
							selected: languages[language] === option.value,
							onClick: () => setLanguage(option.value as Language),
						}))}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Currency"
						onDismiss={onDismiss}
						active={expanded === 'currency'}
						onToggle={handleToggle('currency')}
						options={currencyOptions.map((option) => ({
							label: option.label,
							icon: <div className="currency-icon">{option.sign}</div>,
							onClick: () => setPriceCurrency(option.value),
							selected: priceCurrency.asset === option.value.asset,
						}))}
					/>
				</MenuButtonContainer>
			</Container>
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
	}
`;

const Container = styled.div<{ hasBorder?: boolean }>`
	padding: 24px 32px;
	${(props) =>
		props.hasBorder &&
		css`
			border-top: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
		`}
`;

const MenuButtonContainer = styled.div`
	/* padding-bottom: 16px; */
`;

const LogoContainer = styled.div`
	margin-bottom: 50px;
`;

export default MobileSettingsModal;
