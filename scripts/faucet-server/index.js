const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');
app.use(cors());
const title = 'FIN4XPLORER Demo Faucet Server';

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const config = require('../../src/config/deployment-config.json');
const dripAmount = 0.1; // unit: ether

app.get('/', (req, res) => res.send(title));

app.get('/faucet', (req, res) => {
	console.log('Received funding request: ', req.query);
	sendEther(
		req.query.recipient,
		dripAmount.toString(),
		req.query.networkID.toString(),
		getNetworkURL(req.query.networkID),
		res
	);
});

app.listen(port, () => console.log(title + 'listening on port ' + port));

const sendEther = (recipient, amount, networkID, networkURL, res) => {
	let provider = new HDWalletProvider(config.MNEMONIC, networkURL);
	let web3 = new Web3(provider);
	let address = web3.currentProvider.addresses[0];

	console.log(
		'Attempting to send ' +
			amount +
			' ETH from ' +
			address +
			' to ' +
			recipient +
			', network: ' +
			networkID +
			' ' +
			networkURL
	);

	// TODO derive private key from mnemonic via bip39
	let privateKey = Buffer.from(config.PRIVATE_KEY_OF_FAUCET_ACCOUNT, 'hex');

	//const abi = require('../src/build/contracts/Fin4DemoFaucet').abi;
	//const contract = new web3.eth.Contract(abi, '0xeAFCB3bad95Fc67385D51d9CD60119F227cc32dE');
	//let data = contract.methods.sendDrip('0xe975aF7AFAAe9E9e8aE7bd31A7FC10bB611Dd88A').encodeABI(); //.sendDrip('0xe975aF7AFAAe9E9e8aE7bd31A7FC10bB611Dd88A').encodeABI();

	web3.eth.getTransactionCount(address).then(count => {
		console.log('Transaction count: ' + count);
		const rawTransaction = {
			from: address,
			//gasPrice: web3.utils.toHex(10000000000000),
			//gasLimit: web3.utils.toHex(210000),
			gas: 200000, // TODO good value??
			to: recipient,
			value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')), //'0x0',
			network_id: networkID,
			//data: data,
			nonce: web3.utils.toHex(count)
		};

		var tx = new Tx(rawTransaction);
		tx.sign(privateKey);
		console.log('Transaction is signed');

		web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex')).on('receipt', receipt => {
			let report = 'Sent ' + amount + ' ETH to ' + recipient + ' from ' + address;
			console.log(report);
			res.send(report);
			//process.exit(0);
		});
	});
};

const getNetworkURL = networkID => {
	switch (networkID) {
		case '3':
			return 'wss://ropsten.infura.io/ws/v3/' + config.INFURA_API_KEY;
		case '4':
			return 'wss://rinkeby.infura.io/ws/v3/' + config.INFURA_API_KEY;
		case '5':
			return 'wss://goerli.infura.io/ws/v3/' + config.INFURA_API_KEY;
		case '5777':
			return 'http://127.0.0.1:7545';
	}
};
