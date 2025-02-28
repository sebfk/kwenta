import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import LeverageSlider from '../LeverageSlider';
import CustomNumericInput from 'components/Input/CustomNumericInput';
import Button from 'components/Button';
import { formatNumber } from 'utils/formatters/number';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	leverageState,
	leverageValueCommittedState,
	marketInfoState,
	maxLeverageState,
	nextPriceDisclaimerState,
	orderTypeState,
	positionState,
} from 'store/futures';

type LeverageInputProps = {
	onLeverageChange: (value: string) => void;
};

const LeverageInput: FC<LeverageInputProps> = ({ onLeverageChange }) => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<'slider' | 'input'>('input');
	const leverage = useRecoilValue(leverageState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const orderType = useRecoilValue(orderTypeState);
	const isDisclaimerDisplayed = useRecoilValue(nextPriceDisclaimerState);
	const [, setIsLeverageValueCommitted] = useRecoilState(leverageValueCommittedState);
	const marketInfo = useRecoilValue(marketInfoState);
	const position = useRecoilValue(positionState);

	const modeButton = useMemo(() => {
		return (
			<TextButton
				onClick={() => {
					setMode(mode === 'slider' ? 'input' : 'slider');
				}}
			>
				{mode === 'slider' ? 'Manual' : 'Slider'}
			</TextButton>
		);
	}, [mode]);

	const isDisabled = useMemo(() => {
		return position?.remainingMargin.lte(0) || maxLeverage.lte(0);
	}, [position, maxLeverage]);

	return (
		<LeverageInputWrapper>
			<LeverageRow>
				<LeverageTitle>
					{t('futures.market.trade.input.leverage.title')}&nbsp; —
					<span>&nbsp; Up to {formatNumber(maxLeverage, { maxDecimals: 1 })}x</span>
				</LeverageTitle>
				{modeButton}
			</LeverageRow>
			{orderType === 1 && isDisclaimerDisplayed && (
				<LeverageDisclaimer>
					{t('futures.market.trade.input.leverage.disclaimer')}
				</LeverageDisclaimer>
			)}
			{mode === 'slider' ? (
				<SliderRow>
					<LeverageSlider
						disabled={isDisabled}
						minValue={0}
						maxValue={maxLeverage.toNumber()}
						value={leverage ? Number(leverage) : 0}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(false);
							onLeverageChange(newValue.toString());
						}}
						onChangeCommitted={() => setIsLeverageValueCommitted(true)}
					/>
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<StyledInput
						value={leverage}
						placeholder="1"
						suffix="x"
						maxValue={maxLeverage.toNumber()}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(true);
							onLeverageChange(newValue.toString());
						}}
						disabled={isDisabled}
					/>
					{['2', '5', '10'].map((l) => (
						<LeverageButton
							key={l}
							mono
							onClick={() => {
								onLeverageChange(l);
							}}
							disabled={maxLeverage.lt(Number(l)) || marketInfo?.isSuspended}
						>
							{l}x
						</LeverageButton>
					))}
				</LeverageInputContainer>
			)}
		</LeverageInputWrapper>
	);
};

const LeverageInputWrapper = styled(FlexDivCol)`
	margin-bottom: 16px;
`;

const LeverageRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	padding: 0 14px;
`;

const LeverageTitle = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-transform: capitalize;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 14px;
	position: relative;
`;

const LeverageInputContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 43px 43px 43px;
	grid-gap: 15px;
	align-items: center;
`;

const LeverageButton = styled(Button)`
	padding: 0;
	font-size: 13px;
	height: 46px;
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

const TextButton = styled.button`
	text-decoration: underline;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const LeverageDisclaimer = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin: 0 8px 12px;
`;

export const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.mono};
	text-overflow: ellipsis;
`;

export default LeverageInput;
