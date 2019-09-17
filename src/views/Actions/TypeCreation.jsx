import React, { Component } from 'react';
import ContractForm from '../../components/ContractForm';
import Box from '../../components/Box';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Fin4MainAddress } from '../../config/DeployedAddresses.js';

class TypeCreation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isModalOpen: false
		};
	}

	toggleModal = () => {
		this.setState({ isModalOpen: !this.state.isModalOpen });
	};

	render() {
		return (
			<>
				<Box title="Create a new token">
					<ContractForm
						contractAddress={Fin4MainAddress}
						contractName="Fin4Main"
						method="createNewToken"
						multiSelectOptions={Object.keys(this.props.proofTypes).map(addr => this.props.proofTypes[addr])}
						labels={['Name', 'Symbol', 'Description', 'Proof Types']}
						hideArgs={{
							paramValues: 'paramValues',
							paramValuesIndices: 'paramValuesIndices'
						}}
						helperModalTriggers={[null, null, null, this.toggleModal]}
					/>
				</Box>
				<Modal isOpen={this.state.isModalOpen} handleClose={this.toggleModal} title="Proof Types">
					<Table headers={['Name', 'Description']}>
						<>
							{Object.keys(this.props.proofTypes).map((addr, index) => {
								let proofType = this.props.proofTypes[addr];
								return (
									<TableRow
										key={'proof_' + index}
										data={{
											name: proofType.label,
											description: proofType.description
										}}
									/>
								);
							})}
						</>
					</Table>
				</Modal>
				<Box title="Manage tokens you created">
					<Table headers={['Name', 'Edit']}>
						{Object.keys(this.props.fin4Tokens).map((addr, index) => {
							let token = this.props.fin4Tokens[addr];
							return (
								<TableRow
									key={'token_' + index}
									data={{
										name: token.name + ' [' + token.symbol + ']',
										edit: 'TODO'
									}}
								/>
							);
						})}
					</Table>
				</Box>
			</>
		);
	}
}

TypeCreation.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens,
		proofTypes: state.fin4Store.proofTypes
	};
};

export default drizzleConnect(TypeCreation, mapStateToProps);
