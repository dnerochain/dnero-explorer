var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var helper = require('../helper/utils');
var axios = require("axios").default;
let startTime = { dnero: +new Date(), dtoken: +new Date() };
const cachePeriod = 6 * 1000 // 6 seconds
let cacheData = { dnero: undefined, dtoken: undefined };
var stakeRouter = (app, stakeDao, blockDao, accountDao, progressDao, stakeHistoryDao, config) => {
  router.use(bodyParser.urlencoded({ extended: true }));

  router.get("/stake/all", (req, res) => {
    console.log('Querying all stake.');
    let { types = ['vcp', 'scp'] } = req.query;
    stakeDao.getAllStakesByTypesAsync(types)
      .then(stakeListInfo => {
        const data = ({
          type: 'stake',
          body: stakeListInfo,
        });
        res.status(200).send(data);
      })
      .catch(error => {
        if (error.message.includes('NOT_FOUND')) {
          const err = ({
            type: 'error_not_found',
            error
          });
          res.status(404).send(err);
        } else {
          console.log('ERR - ', error)
        }
      });
  });
  //TODO: remove after merge 3.0 branch
  router.get("/stake/totalAmount/dtoken", async (req, res) => {
    console.log(`Querying total staked dtoken tokens.`);
    let type = 'dtoken';
    let cur = +new Date();
    if (cur - startTime[type] < cachePeriod && cacheData && cacheData[type]) {
      const data = cacheData[type];
      if (data.type === 'stakeTotalAmout') {
        res.status(200).send(data);
      } else if (data.type === 'error_not_found') {
        res.status(404).send(data);
      }
      return;
    }
    startTime[type] = cur;
    progressDao.getStakeProgressAsync(type)
      .then(info => {
        const data = ({
          type: 'stakeTotalAmout',
          body: { totalAmount: info.total_amount, totalNodes: info.holder_num, type: info.type },
        });
        cacheData[type] = data;
        res.status(200).send(data);
      })
      .catch(error => {
        if (error.message.includes('NOT_FOUND')) {
          const err = ({
            type: 'error_not_found',
            error
          });
          cacheData[type] = err;
          res.status(404).send(err);
        } else {
          console.log('ERR - ', error)
        }
      });
  })
  router.get("/stake/totalAmount", (req, res) => {
    let { type = 'dnero' } = req.query;
    console.log(`Querying total staked ${type} tokens.`);
    if (type !== 'dnero' && type !== 'dtoken') {
      res.status(400).send('Wrong parameter.');
      return;
    }
    let cur = +new Date();
    if (cur - startTime[type] < cachePeriod && cacheData && cacheData[type]) {
      const data = cacheData[type];
      if (data.type === 'stakeTotalAmout') {
        res.status(200).send(data);
      } else if (data.type === 'error_not_found') {
        res.status(404).send(data);
      }
      return;
    }
    startTime[type] = cur;
    progressDao.getStakeProgressAsync(type)
      .then(info => {
        const data = ({
          type: 'stakeTotalAmout',
          body: { totalAmount: info.total_amount, totalNodes: info.holder_num, type: info.type },
        });
        cacheData[type] = data;
        res.status(200).send(data);
      })
      .catch(error => {
        if (error.message.includes('NOT_FOUND')) {
          const err = ({
            type: 'error_not_found',
            error
          });
          cacheData[type] = err;
          res.status(404).send(err);
        } else {
          console.log('ERR - ', error)
        }
      });
  });

  router.get("/stake/returnTime", async (req, res) => {
    let { return_height = 0 } = req.query;
    return_height = Number(return_height);
    if (return_height === 0) res.status(400).send('invalid_parameter');
    const networkId = config.blockchain.networkId;
    try {
      const progressInfo = await progressDao.getProgressAsync(networkId);
      const cur_height = progressInfo.height;
      let time = 0;
      if (cur_height < return_height) {
        const num_blocks_past_24_hours = await blockDao.getTotalNumberByHourAsync(24);
        time = (86400 / num_blocks_past_24_hours) * (return_height - cur_height);
      }
      res.status(200).send({
        type: 'stake_return_time',
        body: { time }
      })
    } catch (e) {
      console.log(e)
      res.status(400).send('Error occurs:', e);
    }
  })

  router.get("/stake/:id", (req, res) => {
    console.log('Querying stake by address.');
    let { hasBalance = false, types = ['vcp', 'scp'] } = req.query;
    const address = helper.normalize(req.params.id.toLowerCase());
    //TODO: Remove isChromeExt related after review
    const origin = req.headers.origin;
    const regex = /^chrome-extension:.*$/;
    const isChromeExt = origin && regex.test(origin);
    if (!helper.validateHex(address, 40)) {
      res.status(400).send({ type: 'invalid_address' })
      return;
    }
    stakeDao.getStakeByAddressAsync(address, types)
      .then(async stakeListInfo => {
        // TODO: Remove retry after fix the stake issue
        if (stakeListInfo.holderRecords.length === 0 && stakeListInfo.sourceRecords.length === 0) {
          stakeListInfo = await stakeDao.getStakeByAddressAsync(address, types);
        }
        if (hasBalance === 'true') {
          for (let i = 0; i < stakeListInfo.holderRecords.length; i++) {
            if (stakeListInfo.holderRecords[i].type === 'scp') {
              const accInfo = await accountDao.getAccountByPkAsync(stakeListInfo.holderRecords[i].source);
              stakeListInfo.holderRecords[i].source_dtokenwei_balance = accInfo.balance.dtokenwei;
            }
          }
        }
        //TODO: Remove isChromeExt related after review
        if (isChromeExt) {
          const stakes = JSON.parse(JSON.stringify(stakeListInfo));
          stakeListInfo.stakes = stakes;
        }
        const data = ({
          type: 'stake',
          body: stakeListInfo,
        });
        res.status(200).send(data);
      })
      .catch(error => {
        if (error.message.includes('NOT_FOUND')) {
          const err = ({
            type: 'error_not_found',
            error
          });
          res.status(404).send(err);
        } else {
          console.log('ERR - ', error)
        }
      });
  });

  router.get("/stakeHistory", (req, res) => {
    console.log('Querying all stake.');
    let { type = 'vcp', height = 0, timestamp } = req.query;
    height = +height;
    timestamp = +timestamp;
    if ((Number.isNaN(height) || height === 0) && (Number.isNaN(timestamp) || timestamp === 0)) {
      res.status(400).send("Wrong parameter")
    } else if (!Number.isNaN(height) && height !== 0) {
      stakeHistoryDao.getRecordByTypeAndHeightAsync(type, height)
        .then(infoList => {
          const data = {
            type: 'daily_stake_list',
            body: infoList
          }
          res.status(200).send(data);
        }).catch(error => {
          res.status(404).send(error)
        })
    } else {
      stakeHistoryDao.getLatestTimestampAsync(timestamp)
        .then(ts => {
          stakeHistoryDao.getRecordByTypeAndTimestampAsync(type, ts)
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
  });

  //the / route of router will get mapped to /api
  app.use('/api', router);
}

module.exports = stakeRouter;