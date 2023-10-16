var rpc = require('../api/rpc.js');
var accountHelper = require('../helper/account');
var stakeHelper = require('../helper/stake');
var rewardHelper = require('../helper/reward-distribution');
var txHelper = require('../helper/transactions');
var fs = require('fs');
var Logger = require('../helper/logger');
var { TxnTypes } = require('../helper/constants');
var scHelper = require('../helper/smart-contract');

const { createIndexes } = require('../helper/utils');
const { updateRewardDistributions } = require('../helper/reward-distribution.js');

//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var configFileName = 'config.cfg'
var initialAccounts = {};
var accountFileName = 'dnero-balance-height.json'
var progressDao = null;
var blockDao = null;
var transactionDao = null;
var accountDao = null;
var accountTxDao = null;
var stakeDao = null;
var subStakeDao = null;
var checkpointDao = null;
var smartContractDao = null;
var dailyAccountDao = null;
var rewardDistributionDao = null;
var tokenDao = null;
var tokenSummaryDao = null;
var maxBlockPerCrawl;
var targetCrawlHeight;
var txsCount = 0;
var crawledBlockHeightProgress = 0;
var latestBlockHeight = 0;
var upsertTransactionAsyncList = [];
var validTransactionList = [];
var cacheEnabled = false;
var chainType = 'mainchain';

var stakeBlockHeight = 0;
var stakeTimestamp = 0;
var contractMap = {};
// dec
var startTime;
//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------
exports.Initialize = function (progressDaoInstance, blockDaoInstance, transactionDaoInstance, accountDaoInstance,
  accountTxDaoInstance, stakeDaoInstance, checkpointDaoInstance, smartContractDaoInstance, dailyAccountDaoInstance,
  rewardDistributionDaoInstance, stakeHistoryDaoInstance, tokenDaoInstance, tokenSummaryDaoInstance,
  tokenHolderDaoInstance, subStakeDaoInstance, cacheEnabledConfig, maxBlockPerCrawlConfig, chainTypeConfig, contractMapConfig) {
  blockDao = blockDaoInstance;
  progressDao = progressDaoInstance;
  transactionDao = transactionDaoInstance;
  accountDao = accountDaoInstance;
  accountTxDao = accountTxDaoInstance;
  stakeDao = stakeDaoInstance;
  subStakeDao = subStakeDaoInstance;
  checkpointDao = checkpointDaoInstance;
  smartContractDao = smartContractDaoInstance;
  dailyAccountDao = dailyAccountDaoInstance;
  rewardDistributionDao = rewardDistributionDaoInstance;
  stakeHistoryDao = stakeHistoryDaoInstance;
  tokenDao = tokenDaoInstance;
  tokenSummaryDao = tokenSummaryDaoInstance;
  tokenHolderDao = tokenHolderDaoInstance;
  cacheEnabled = cacheEnabledConfig;
  maxBlockPerCrawl = Number(maxBlockPerCrawlConfig);
  maxBlockPerCrawl = Number.isNaN(maxBlockPerCrawl) ? 2 : maxBlockPerCrawl;
  chainType = chainTypeConfig || 'mainchain';
  contractMap = contractMapConfig;
}

exports.Execute = async function (networkId) {
  await progressDao.getProgressAsync(networkId)
    .then(function (progressInfo) {
      Logger.log('Start a new crawler progress');
      Logger.log('progressInfo:', JSON.stringify(progressInfo));
      txsCount = progressInfo.count;
      crawledBlockHeightProgress = progressInfo.height;
      Logger.log('DB transaction count progress: ' + txsCount.toString());
      Logger.log('crawledBlockHeightProgress: ', crawledBlockHeightProgress);
      return rpc.getPendingTxsAsync([])
    })
    .then(async function (data) {
      const result = JSON.parse(data);
      const pendingTxList = result.result.tx_hashes;
      let upsertTransactionAsyncList = [];
      for (let hash of pendingTxList) {
        const transaction = {
          hash: hash,
          status: 'pending'
        }
        const isExisted = await transactionDao.checkTransactionAsync(transaction.hash);
        if (!isExisted) {
          transaction.number = ++txsCount;
          validTransactionList.push(transaction);
          upsertTransactionAsyncList.push(transactionDao.upsertTransactionAsync(transaction));
        }
      }
      Logger.log(`Number of upsert PENDING transactions: ${upsertTransactionAsyncList.length}`);
      return Promise.all(upsertTransactionAsyncList)
    })
    .then(() => {
      return rpc.getStatusAsync([]) // read block height from chain
    })
    .then(function (data) {
      var result = JSON.parse(data);
      latestBlockHeight = +result.result.latest_finalized_block_height;
      Logger.log('Latest block height: ' + latestBlockHeight);
      startTime = +new Date();
      stakeBlockHeight = 0;
      Logger.log('DB block height progress: ' + crawledBlockHeightProgress.toString());

      if (latestBlockHeight >= crawledBlockHeightProgress) {
        // get target crawl height
        targetCrawlHeight = crawledBlockHeightProgress + maxBlockPerCrawl;
        if (latestBlockHeight < targetCrawlHeight) {
          targetCrawlHeight = latestBlockHeight;
        }

        var getBlockAsyncList = [];
        var getStakeAsyncList = [];
        var getRewardAsyncList = [];
        for (var i = crawledBlockHeightProgress + 1; i <= targetCrawlHeight; i++) {
          if (i % 10000 === 0) {
            stakeBlockHeight = i;
            stakeTimestamp = +new Date()
          }
          getBlockAsyncList.push(rpc.getBlockByHeightAsync([{ 'height': i.toString(), 'include_eth_tx_hashes': true }]));
          getRewardAsyncList.push(rpc.getStakeRewardDistributionAsync([{ 'height': i.toString() }]));
        }
        if (chainType === 'mainchain') {
          getStakeAsyncList.push(rpc.getVcpByHeightAsync([{ 'height': targetCrawlHeight.toString() }]));
          getStakeAsyncList.push(rpc.getScpByHeightAsync([{ 'height': targetCrawlHeight.toString() }]));
          getStakeAsyncList.push(rpc.getEenpByHeightAsync([{ 'height': targetCrawlHeight.toString() }]));
        } else {
          getStakeAsyncList.push(rpc.GetValidatorSetByHeightAsync([{ 'height': targetCrawlHeight.toString() }]));
        }

        return Promise.all(getBlockAsyncList.concat(getStakeAsyncList).concat(getRewardAsyncList))
      } else {
        Logger.error('Block crawling is up to date.');
      }
    })
    .then(async function (blockDataList) {
      let curTime = +new Date();
      Logger.log(`Query block info takes: ${curTime - startTime} ms`)
      if (blockDataList) {
        var upsertBlockAsyncList = [];
        var upsertVcpAsyncList = [];
        var updateVcpAsyncList = [];
        var updateScpAsyncList = [];
        var upsertScpAsyncList = [];
        var updateEenpAsyncList = [];
        var upsertEenpAsyncList = [];
        var updateVsAsyncList = [];
        var upsertVsAsyncList = [];
        var updateRewardAsyncList = [];
        var upsertRewardAsyncList = [];
        var insertStakeHistoryList = [];
        var upsertTransactionAsyncList = [];
        var checkpoint_height, checkpoint_hash;
        var upsertCheckpointAsyncList = [];
        var updateTokenList = [];
        var tokenTxs = [];
        var stakes = { vcp: [], scp: [], eenp: [] };
        var subStakes = { vs: [] };
        for (var i = 0; i < blockDataList.length; i++) {
          // Store the block data
          var result = JSON.parse(blockDataList[i]);

          if (result.result !== undefined) {
            if (result.result.BlockHashVcpPairs) {  // handle vcp response
              if (stakeBlockHeight !== 0 && upsertVcpAsyncList.length === 0) {
                insertStakeHistoryList.push(stakeHelper.insertStakePairs(result.result.BlockHashVcpPairs,
                  'vcp', stakeBlockHeight, stakeTimestamp, stakeHistoryDao))
              }
              if (upsertVcpAsyncList.length > 0) continue;
              stakes.vcp = result.result.BlockHashVcpPairs;
              // await stakeDao.removeRecordsAsync('vcp');
              result.result.BlockHashVcpPairs.forEach(vcpPair => {
                vcpPair.Vcp.SortedCandidates.forEach(candidate => {
                  updateVcpAsyncList.push(candidate);
                  // upsertVcpAsyncList.push(stakeHelper.updateStake(candidate, 'vcp', stakeDao));
                })
              })
              upsertVcpAsyncList.push(stakeHelper.updateStakes(updateVcpAsyncList, 'vcp', stakeDao, cacheEnabled));
            } else if (result.result.BlockHashScpPairs) { // handle SCP response
              if (stakeBlockHeight !== 0 && upsertScpAsyncList.length === 0) {
                insertStakeHistoryList.push(stakeHelper.insertStakePairs(result.result.BlockHashScpPairs,
                  'scp', stakeBlockHeight, stakeTimestamp, stakeHistoryDao))
              }
              if (upsertScpAsyncList.length > 0) continue;
              stakes.scp = result.result.BlockHashScpPairs;
              // await stakeDao.removeRecordsAsync('scp');
              result.result.BlockHashScpPairs.forEach(scpPair => {
                scpPair.Scp.SortedSentrys.forEach(candidate => {
                  updateScpAsyncList.push(candidate);
                  // upsertScpAsyncList.push(stakeHelper.updateStake(candidate, 'scp', stakeDao));
                })
              })
              upsertScpAsyncList.push(stakeHelper.updateStakes(updateScpAsyncList, 'scp', stakeDao, cacheEnabled));
            } else if (result.result.BlockHashEenpPairs) {  // hanndle EENP response
              if (stakeBlockHeight !== 0 && upsertEenpAsyncList.length === 0) {
                insertStakeHistoryList.push(stakeHelper.insertStakePairs(result.result.BlockHashEenpPairs,
                  'eenp', stakeBlockHeight, stakeTimestamp, stakeHistoryDao))
              }
              if (upsertEenpAsyncList.length > 0) continue;
              stakes.eenp = result.result.BlockHashEenpPairs;
              result.result.BlockHashEenpPairs.forEach(eenpPair => {
                eenpPair.EENs.forEach(candidate => {
                  updateEenpAsyncList.push(candidate);
                })
              })
              Logger.log(`updateEenpAsyncList length: ${updateEenpAsyncList.length}`);
              upsertEenpAsyncList.push(stakeHelper.updateStakes(updateEenpAsyncList, 'eenp', stakeDao, cacheEnabled));
            } else if (result.result.BlockHashStakeRewardDistributionRuleSetPairs) { // handle split reward distribution
              if (upsertRewardAsyncList.length > 0) continue;
              result.result.BlockHashStakeRewardDistributionRuleSetPairs.forEach(pair => {
                pair.StakeRewardDistributionRuleSet.forEach(s => {
                  updateRewardAsyncList.push(s);
                })
              })
              upsertRewardAsyncList.push(rewardHelper.updateRewardDistributions(updateRewardAsyncList, rewardDistributionDao, cacheEnabled))
            } else if (result.result.BlockHashValidatorSetPairs) {
              subStakes.vs = result.result.BlockHashValidatorSetPairs;
              result.result.BlockHashValidatorSetPairs.forEach(pair => {
                pair.ValidatorSet.Validators.forEach(s => {
                  updateVsAsyncList.push(s);
                })
              })
              upsertVsAsyncList.push(stakeHelper.updateSubStakes(updateVsAsyncList, 'vs', subStakeDao, cacheEnabled));
            } else {  //handle block response
              var txs = result.result.transactions;
              if (txs == undefined) {
                Logger.log(`txs info is not found in the block info: ${JSON.stringify(result.result)}, skip the current loop.`);
                continue;
              }
              const blockInfo = {
                epoch: result.result.epoch,
                status: result.result.status,
                height: result.result.height,
                timestamp: result.result.timestamp,
                hash: result.result.hash,
                parent_hash: result.result.parent,
                proposer: result.result.proposer,
                state_hash: result.result.state_hash,
                transactions_hash: result.result.transactions_hash,
                num_txs: result.result.transactions.length,
                txs: txHelper.getBriefTxs(result.result.transactions),
                children: result.result.children,
                hcc: result.result.hcc,
                sentry_votes: result.result.sentry_votes
              }
              if (result.result.height % 100 === 1) {
                checkpoint_height = blockInfo.height;
                checkpoint_hash = blockInfo.hash
              }
              upsertBlockAsyncList.push(blockDao.upsertBlockAsync(blockInfo));
              // Store the transaction data
              if (txs !== undefined && txs.length > 0) {
                for (var j = 0; j < txs.length; j++) {
                  const transaction = {
                    hash: txs[j].hash,
                    eth_tx_hash: txs[j].eth_tx_hash,
                    type: txs[j].type,
                    data: txs[j].raw,
                    block_height: blockInfo.height,
                    timestamp: blockInfo.timestamp,
                    receipt: txs[j].receipt,
                    status: 'finalized'
                  }
                  const isExisted = await transactionDao.checkTransactionAsync(transaction.hash);
                  if (!isExisted) {
                    transaction.number = ++txsCount;
                    validTransactionList.push(transaction);
                    upsertTransactionAsyncList.push(transactionDao.upsertTransactionAsync(transaction));
                  } else {
                    const tx = await transactionDao.getTransactionByPkAsync(transaction.hash);
                    transaction.number = tx.number;
                    validTransactionList.push(transaction);
                    upsertTransactionAsyncList.push(transactionDao.upsertTransactionAsync(transaction));
                  }
                  if (transaction.type === TxnTypes.SMART_CONTRACT) {
                    tokenTxs.push(transaction);
                    // updateTokenList.push(scHelper.updateToken(transaction, smartContractDao, tokenDao, tokenSummaryDao, tokenHolderDao));
                  }
                }
              }
            }
          }
        }
        if (tokenTxs.length !== 0) {
          updateTokenList.push(scHelper.updateTokenByTxs(tokenTxs, smartContractDao, tokenDao, tokenSummaryDao,
            tokenHolderDao, contractMap, chainType));
        }
        if (stakes.vcp.length !== 0) {
          // Update total stake info
          upsertScpAsyncList.push(stakeHelper.updateTotalStake(stakes, progressDao))
        }
        if (subStakes.vs.length !== 0) {
          upsertVsAsyncList.push(stakeHelper.updateTotalSubStake(subStakes, progressDao));
        }
        if (checkpoint_hash)
          for (var i = 0; i < blockDataList.length; i++) {
            var result = JSON.parse(blockDataList[i]);
            if (result.result !== undefined && result.result.BlockHashScpPairs)
              result.result.BlockHashScpPairs.forEach(scpPair => {
                if (scpPair.BlockHash === checkpoint_hash) {
                  upsertCheckpointAsyncList.push(checkpointDao.insertAsync({
                    height: parseInt(checkpoint_height),
                    hash: checkpoint_hash,
                    sentrys: scpPair.Scp.SortedSentrys
                  }))
                }
              })
          }
        Logger.log(`Number of upsert BLOCKS: ${upsertBlockAsyncList.length}`);
        Logger.log(`Number of upsert VCP: ${upsertVcpAsyncList.length}`);
        Logger.log(`Number of upsert SCP: ${upsertScpAsyncList.length}`);
        Logger.log(`Number of upsert EENP: ${upsertEenpAsyncList.length}`);
        Logger.log(`Number of upsert Reward split distribution: ${upsertRewardAsyncList.length}`);
        Logger.log(`Number of upsert check points: ${upsertCheckpointAsyncList.length}`);
        Logger.log(`Number of upsert TRANSACTIONS: ${upsertTransactionAsyncList.length}`);
        Logger.log(`Number of upsert TOKEN txs: ${updateTokenList.length}`);
        return Promise.all(upsertBlockAsyncList, upsertVcpAsyncList, upsertScpAsyncList,
          upsertTransactionAsyncList, upsertCheckpointAsyncList, upsertEenpAsyncList, upsertRewardAsyncList,
          txHelper.updateFees(validTransactionList, progressDao), updateTokenList, upsertVsAsyncList)
      }
    })
    .then(() => {
      Logger.log('update account after handle all stakes')
      accountHelper.updateAccount(accountDao, accountTxDao, smartContractDao, dailyAccountDao, validTransactionList);
    })
    .then(async function () {
      validTransactionList = [];
      Logger.log('targetCrawlHeight: ', targetCrawlHeight, '. txsCount: ', txsCount)
      await progressDao.upsertProgressAsync(networkId, targetCrawlHeight, txsCount);
      Logger.log('Crawl progress updated to ' + targetCrawlHeight.toString());
      Logger.log('The end of a new crawler progress');
    })
    .catch(async function (error) {
      if (error) {
        if (error.message === 'No progress record') {
          Logger.log('Initializng progress record..');
          Logger.log('Loading config file: ' + configFileName)
          try {
            config = JSON.parse(fs.readFileSync(configFileName));
          } catch (err) {
            Logger.log('Error: unable to load ' + configFileName);
            Logger.log(err);
            process.exit(1);
          }
          Logger.log('Creating indexes...')
          await createIndexes();
          const startHeight = Number(config.blockchain.startHeight) - 1 || 0;
          Logger.log(`startHeight: ${startHeight}, type: ${typeof startHeight}`);
          progressDao.upsertProgressAsync(networkId, startHeight, 0);
          Logger.log('Loading initial accounts file: ' + accountFileName)
          try {
            initialAccounts = JSON.parse(fs.readFileSync(accountFileName));
          } catch (err) {
            Logger.error('Error: unable to load ' + accountFileName);
            Logger.error(err);
            process.exit(1);
          }
          Object.keys(initialAccounts).forEach(function (address, i) {
            setTimeout(function () {
              Logger.log(i)
              accountHelper.updateAccountByAddress(address, accountDao)
            }, i * 10);
          })
        } else {
          Logger.error(error);
        }
      }
    })
}