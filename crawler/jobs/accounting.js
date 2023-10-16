var Logger = require('../helper/logger');

const BigNumber = require('bignumber.js');
const rp = require('request-promise');
const COINBASE = 0;
const WEI = 1000000000000000000;
const DTOKEN_ID = '0200';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

let txDao = null;
let acctTxDao = null;
let accountingDao = null;
let coinmarketcapApiKey = null;
let walletAddrs = null;

exports.InitializeForDTokenPrice = function (accountingDaoInstance, coinbaseApiKeyStr, walletAddresses) {
    accountingDao = accountingDaoInstance;
    coinmarketcapApiKey = coinbaseApiKeyStr;
    walletAddrs = walletAddresses;
}

exports.RecordDTokenPrice = async function () {
    let dtokenPrice = await getCoinbasePrice();
    let [startTime] = getDayTimes();

    for (let addr of walletAddrs) {
        const data = { date: startTime, addr: addr, price: dtokenPrice };
        accountingDao.insertAsync(data);
    }
}

exports.InitializeForDTokenEarning = function (transactionDaoInstance, accountTransactionDaoInstance, accountingDaoInstance, walletAddresses) {
    txDao = transactionDaoInstance;
    acctTxDao = accountTransactionDaoInstance;
    accountingDao = accountingDaoInstance;
    walletAddrs = walletAddresses;
}

exports.RecordDTokenEarning = async function () {
    let [startTime, endTime] = getDayTimes();
    for (let addr of walletAddrs) {
        processEarning(addr, startTime, endTime);
    }
}

function getDayTimes() {
    var date = new Date();
    date.setUTCHours(0,0,0,0);
    var endTime = date.getTime() / 1000;
    date.setDate(date.getDate() - 1);
    var startTime = date.getTime() / 1000;
    return [startTime, endTime];
}

async function processEarning(address, startTime, endTime) {
    let txHashes = await acctTxDao.getTxHashesAsync(address, startTime.toString(), endTime.toString(), COINBASE);
    let hashes = [];
    txHashes.forEach(function(txHash){
      hashes.push(txHash.hash);
    });

    let txs = await txDao.getTransactionsByPkAsync(hashes);
    let totalDToken = new BigNumber(0);
    for (let tx of txs) {
        for (let output of tx.data.outputs) {
            if (output.address === address) {
                totalDToken = new BigNumber.sum(totalDToken, new BigNumber(output.coins.dtokenwei));
                break;
            }
        }
    }

    const queryObj = { addr: address, date: startTime };
    const updateObj = { qty: Number(totalDToken.dividedBy(WEI).toFixed(2)) };
    accountingDao.upsertAsync(queryObj, updateObj);
}

function getCoinbasePrice() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        qs: {
            'id': DTOKEN_ID
        },
        headers: {
            'X-CMC_PRO_API_KEY': coinmarketcapApiKey
        },
        json: true,
        gzip: true
    };

    return rp(requestOptions).then(res => {
        return res.data[DTOKEN_ID].quote.USD.price
    }).catch((err) => {
        Logger.log('Coinbase API call error:', err.message);
    });
}