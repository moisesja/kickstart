const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Get reference to the build directory
const buildPath = path.resolve(__dirname, 'build');

// Reset folder
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

// Get reference to contracts folder
const contractsPath = path.resolve(__dirname, 'contracts');

// Get file names from folder
const fileNames = fs.readdirSync(contractsPath);

const input = fileNames.reduce(
    (input, fileName) => {
      const filePath = path.resolve(__dirname, 'contracts', fileName);
      const source = fs.readFileSync(filePath, 'utf8');
      return { sources: { ...input.sources, [fileName]: source } };
    },
    { sources: {} }
);

// Compile both contracts with the Solidity compiler
const output = solc.compile(input, 1).contracts;

for (let contract in output) {
    fs.outputJsonSync(
      path.resolve(buildPath, contract.split(':')[1] + '.json'),
      output[contract]
    );
}
