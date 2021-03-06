import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { contractCall } from '../../components/Contractor';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { IconButton } from '@material-ui/core';

function ConvertToCollateral(props, context) {
	const { t } = useTranslation();

	const [done, setDone] = useState(false);

	const convert = (data, patContractDrizzleName) => {
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		let sourcererContract = context.drizzle.contracts[data.sourcererName];
		contractCall(
			context,
			props,
			defaultAccount,
			patContractDrizzleName,
			'approve',
			[sourcererContract.address, data.amount],
			'Approve PAT spending',
			{
				transactionCompleted: () => {
					contractCall(
						context,
						props,
						defaultAccount,
						data.sourcererName,
						'convert',
						[data.patAddress, data.collateralAddress, data.amount],
						'Converting PAT to collateral on ' + data.sourcererName,
						{
							transactionCompleted: () => {
								// TODO causes Error: You may not unsubscribe from a store listener while the reducer is executing
								// setDone(true);
							}
						}
					);
				}
			}
		);
	};

	return (
		<Container>
			{done ? (
				<center>
					<IconButton style={{ color: 'green', transform: 'scale(2.4)' }}>
						<CheckIcon />
					</IconButton>
				</center>
			) : (
				<CollateralInteractionComponent
					title="Convert to collateral"
					matchParams={props.match.params}
					buttonLabel="Convert"
					contractToGetReady="patAddress"
					buttonClickedAndContractReadyCallback={(data, patContractDrizzleName) =>
						convert(data, patContractDrizzleName)
					}
				/>
			)}
		</Container>
	);
}

ConvertToCollateral.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(ConvertToCollateral, mapStateToProps);
