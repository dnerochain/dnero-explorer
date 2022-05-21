var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var helper = require('../helper/utils');


var supplyRouter = (app, progressDao, dailyDtokenBurntDao, rpc, config) => {
  router.use(bodyParser.urlencoded({ extended: true }));

  // The api to get total amount of Dnero
  router.get("/supply/dnero", (req, res) => {
    console.log('Querying the total amount of Dnero.');
    const data = ({
      "total_supply": 1000000000,
      "circulation_supply": 1000000000
    });
    res.status(200).send(data);
  });

  // The api to get total amount of DToken
  router.get("/supply/dtoken", (req, res) => {
    console.log('Querying the total amount of Dtoken.');
    if (config.blockchain.networkId !== 'main_net_chain') {
      const data = ({
        "total_supply": 5000000000,
        "circulation_supply": 5000000000
      });
      res.status(200).send(data);
      return;
    }
    progressDao.getProgressAsync(config.blockchain.networkId)
      .then(async progressInfo => {
        try {
          const height = progressInfo.height;
          let response = await rpc.getAccountAsync([{ 'address': '0x0' }]);
          let account = JSON.parse(response).result;
          const addressZeroBalance = account ? account.coins.dtokenwei : 0;
          const feeInfo = await progressDao.getFeeAsync()
          const burntAmount = helper.sumCoin(addressZeroBalance, feeInfo.total_fee).toFixed();
          const supply = 5000000000 + ~~((10968061 - 4164982) / 100) * 4800 + ~~((height - 10968061) / 100) * 8600 - helper.formatCoin(burntAmount).toFixed(0);
          const data = ({
            "total_supply": supply,
            "circulation_supply": supply
          })
          res.status(200).send(data);
        } catch (err) {
          res.status(400).send(err.message);
          return;
        }
      }).catch(err => {
        res.status(400).send(err.message);
      })
  });

  router.get("/supply/dtoken/burnt", async (req, res) => {
    console.log('Querying the total Dtoken burnt amount.');
    try {
      let response = await rpc.getAccountAsync([{ 'address': '0x0' }]);
      let account = JSON.parse(response).result;
      const addressZeroBalance = account ? account.coins.dtokenwei : 0;
      const feeInfo = await progressDao.getFeeAsync()
      const burntAmount = helper.sumCoin(addressZeroBalance, feeInfo.total_fee).toFixed();
      const data = ({
        "address_zero_dtokenwei_balance": addressZeroBalance,
        "total_dtokenwei_burnt_as_transaction_fee": feeInfo.total_fee,
        "total_dtokenwei_burnt": burntAmount,
      })
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(err.message);
    }
  })

  router.get("/supply/dailyDtokenBurnt", async (req, res) => {
    let { timestamp = 0 } = req.query;
    if (Number.isNaN(timestamp)) {
      res.status(400).send("Wrong parameter")
    } else if (timestamp === 0) {
      dailyDtokenBurntDao.getLatestRecordAsync()
        .then(info => {
          const data = {
            type: 'daily_stake_list',
            body: info
          }
          res.status(200).send(data);
        }).catch(error => {
          res.status(404).send(error)
        })
    } else {
      dailyDtokenBurntDao.getLatestTimestampAsync(timestamp)
        .then(ts => {
          dailyDtokenBurntDao.getRecordByTimestampAsync(ts)
            .then(infoList => {
              const data = {
                type: 'daily_stake_list',
                body: infoList
              }
              res.status(200).send(data);
            }).catch(error => {
              res.status(404).send(error.message)
            })
        }).catch(error => {
          res.status(404).send(error.message)
        })
    }
  })

  //the / route of router will get mapped to /api
  app.use('/api', router);
}

module.exports = supplyRouter;