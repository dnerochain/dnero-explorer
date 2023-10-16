
//------------------------------------------------------------------------------
//  DAO for account
//  Require index: `db.account.createIndex({"balance.dnerowei": -1})`
//  Require index: `db.account.createIndex({"balance.dtokenwei": -1})`
//------------------------------------------------------------------------------

module.exports = class AccountDAO {

  constructor(execDir, client) {
    this.client = client;
    this.accountInfoCollection = 'account';
  }

  upsertAccount(accountInfo, callback) {
    // console.log('accountInfo in upsert:', accountInfo)
    const newObject = {
      'address': accountInfo.address,
      'balance': accountInfo.balance,
      'sequence': accountInfo.sequence,
      'reserved_funds': accountInfo.reserved_funds === null ? 'null' : accountInfo.reserved_funds,
      // 'lst_updt_blk': accountInfo.last_updated_block_height,
      'txs_counter': accountInfo.txs_counter,
      'code': accountInfo.code
    }
    const queryObject = { '_id': newObject.address };
    this.client.upsert(this.accountInfoCollection, queryObject, newObject, callback);
  }
  checkAccount(address, callback) {
    const queryObject = { '_id': address };
    return this.client.exist(this.accountInfoCollection, queryObject, function (err, res) {
      if (err) {
        console.log('error in checkAccount: ', err);
        callback(err);
      }
      callback(err, res);
    });
  }
  getTotalNumber(callback) {
    this.client.getTotal(this.accountInfoCollection, null, function (error, record) {
      if (error) {
        console.log('Account getTotalNumber ERR - ', error);
        callback(error);
      } else {
        callback(error, record);
      }
    });
  }
  getTopAccounts(tokenType, limitNumber, callback) {
    const key = "balance." + tokenType;
    const sortObject = { [key]: -1 };
    this.client.getTopRecords(this.accountInfoCollection, {}, sortObject, limitNumber, function (error, recordList) {
      var accountInfoList = []
      for (var i = 0; i < recordList.length; i++) {
        var accountInfo = {};
        accountInfo.address = recordList[i].address;
        accountInfo.balance = recordList[i].balance;
        accountInfo.sequence = recordList[i].sequence;
        accountInfo.reserved_funds = recordList[i].reserved_funds;
        accountInfo.txs_counter = recordList[i].txs_counter;
        accountInfo.code = recordList[i].code;
        accountInfoList.push(accountInfo)
      }
      callback(error, accountInfoList)
    })
  }
  getAccountByPk(address, callback) {
    const queryObject = { '_id': address };
    this.client.findOne(this.accountInfoCollection, queryObject, function (error, record) {
      if (error) {
        console.log('Account getAccountByPk ERR - ', error, address);
        callback(error);
      } else if (!record) {
        callback(Error('NOT_FOUND - ' + address));
      } else {
        // console.log('account info in record: ', record)
        var accountInfo = {};
        accountInfo.address = record.address;
        accountInfo.balance = record.balance;
        accountInfo.sequence = record.sequence;
        accountInfo.reserved_funds = record.reserved_funds;
        accountInfo.txs_counter = record.txs_counter;
        accountInfo.code = record.code;
        callback(error, accountInfo);
      }
    })
  }

}