const AttributeStore = artifacts.require('tcr/AttributeStore');
const DLL = artifacts.require('tcr/PLCR/dependencies/DLL');
const PLCRFactory = artifacts.require('tcr/PLCRFactory');
const ParameterizerFactory = artifacts.require('tcr/ParameterizerFactory');
const RegistryFactory = artifacts.require('tcr/RegistryFactory');
const ERC20Plus = artifacts.require('tokens/ERC20Plus');
const Fin4Reputation = artifacts.require('Fin4Reputation');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));
const paramConfig = config.paramConfig;

module.exports = async function(deployer) {
	// Deploy Dependencies
	await deployer.deploy(DLL);
	await deployer.deploy(AttributeStore);

	// Deploy PLCRFactory
	await deployer.link(DLL, PLCRFactory);
	await deployer.link(AttributeStore, PLCRFactory);
	await deployer.deploy(PLCRFactory);

	// Deploy ParametrizerFactory
	await deployer.link(DLL, ParameterizerFactory);
	await deployer.link(AttributeStore, ParameterizerFactory);
	const parametrizerFactoryInstance = await deployer.deploy(ParameterizerFactory, PLCRFactory.address);

	// Deploy RegistryFactory
	await deployer.link(DLL, RegistryFactory);
	await deployer.link(AttributeStore, RegistryFactory);
	const registryFactoryInstance = await deployer.deploy(RegistryFactory, ParameterizerFactory.address);

	await deployer.deploy(Fin4Reputation);
	const Fin4ReputationInstance = await Fin4Reputation.deployed();

	const GOVToken = await deployer.deploy(
		ERC20Plus,
		'Governance Token',
		'GOV',
		250,
		Fin4ReputationInstance.address,
		true,
		true,
		true,
		0
	);

	const registryReceipt = await registryFactoryInstance.newRegistryWithToken(
		config.token.supply,
		config.token.name,
		config.token.decimals,
		config.token.symbol,
		[
			paramConfig.minDeposit,
			paramConfig.pMinDeposit,
			paramConfig.applyStageLength,
			paramConfig.pApplyStageLength,
			paramConfig.commitStageLength,
			paramConfig.pCommitStageLength,
			paramConfig.revealStageLength,
			paramConfig.pRevealStageLength,
			paramConfig.dispensationPct,
			paramConfig.pDispensationPct,
			paramConfig.voteQuorum,
			paramConfig.pVoteQuorum,
			paramConfig.exitTimeDelay,
			paramConfig.exitPeriodLen
		],
		config.name
	);

	console.log(registryReceipt.logs);
};