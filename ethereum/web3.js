import Web3 from 'web3';

// Grab the provider injected by Metamask
// This provider manages the private key for our accounts
const web3 = new Web3(window.web3.currentProvider);

export default web3;