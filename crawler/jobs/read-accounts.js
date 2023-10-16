var Logger = require('../helper/logger');
var rpc = require('../api/rpc.js');
var helper = require('../helper/utils');
const { default: BigNumber } = require('bignumber.js');

let activeActDao = null;
let dailyAccountDao = null;
let totalActDao = null;
let accountDao = null;
let dailyDtokenBurntDao = null;

exports.Initialize = function (dailyAccountDaoInstance, activeActDaoInstance, totalActDaoInstance, accountDaoInstance, dailyDtokenBurntDaoInstance) {
  dailyAccountDao = dailyAccountDaoInstance;
  activeActDao = activeActDaoInstance;
  totalActDao = totalActDaoInstance;
  accountDao = accountDaoInstance;
  dailyDtokenBurntDao = dailyDtokenBurntDaoInstance;
}

exports.Execute = function () {
  let timestamp = (new Date().getTime() / 1000).toFixed();
  dailyAccountDao.getTotalNumberAsync()
    .then(async res => {
      await activeActDao.insertAsync({ amount: res, timestamp });
      await dailyAccountDao.removeAllAsync();
    }).catch(err => {
      Logger.log('error from daily account getTotalNumber:', err);
    })
  accountDao.getTotalNumberAsync()
    .then(async res => {
      await totalActDao.insertAsync({ amount: res, timestamp });
    }).catch(err => {
      Logger.log('error from account getTotalNumber:', err);
    })
  dailyDtokenBurntDao.getLatestRecordAsync()
    .then(async res => {
      _dailyDtokenBurntInsert(res);
    }).catch(err => {
      Logger.log('error from getLatestRecordAsync:', err);
      if (err.message.includes('NO_RECORD')) {
        _dailyDtokenBurntInsert();
      }
    })
}

async function _dailyDtokenBurntInsert(preData) {
  let timestamp = (new Date().getTime() / 1000).toFixed();
  try {
    let response = await rpc.getAccountAsync([{ 'address': '0x0' }]);
    let account = JSON.parse(response).result;
    const addressZeroBalance = account ? account.coins.dtokenwei : 0;
    const feeInfo = await progressDao.getFeeAsync()
    const burntAmount = helper.sumCoin(addressZeroBalance, feeInfo.total_fee);
    let dailyDtokenBurnt = '0';
    if (preData) {
      dailyDtokenBurnt = burntAmount.minus(new BigNumber(preData.totalDtokenBurnt)).toFixed();
    }
    await dailyDtokenBurntDao.insertAsync({
      timestamp,
      dailyDtokenBurnt,
      totalDtokenBurnt: burntAmount.toFixed()
    })
  } catch (err) {
    Logger.log('error from getLatestRecordAsync try catch:', err);
  }
}