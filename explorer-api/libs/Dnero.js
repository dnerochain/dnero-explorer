var BigNumber = require('bignumber.js');
var DneroJS = require('./dnerojs.esm');
var _chainId = "mainnet";

class Dnero {

  static set chainId(chainId) {
    _chainId = chainId;
  }
  static get chainId() {
    return _chainId;
  }

  static getTransactionFee() {
    //10^12 DTokenWei
    return 0.000001;
  }

  static unsignedSmartContractTx(txData, sequence) {
    let { from, to, data, value, transactionFee, gasLimit } = txData;

    const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Dnero = 10^18 DneroWei, 1 Gamma = 10^ DTokenWei
    const feeInDTokenWei = (new BigNumber(transactionFee)).multipliedBy(ten18); // Any fee >= 10^12 DTokenWei should work, higher fee yields higher priority
    const senderSequence = sequence;
    const gasPrice = feeInDTokenWei;

    let tx = new DneroJS.SmartContractTx(from, to, gasLimit, gasPrice, data, value, senderSequence);

    return tx;
  }
}

module.exports = Dnero;