exports.TxnTypes = {
  COINBASE: 0,
  SLASH: 1,
  TRANSFER: 2,
  RESERVE_FUND: 3,
  RELEASE_FUND: 4,
  SERVICE_PAYMENT: 5,
  SPLIT_CONTRACT: 6,
  SMART_CONTRACT: 7,
  DEPOSIT_STAKE: 8,
  WITHDRAW_STAKE: 9,
  DEPOSIT_STAKE_TX_V2: 10,
  STAKE_REWARD_DISTRIBUTION: 11
}

exports.ZeroAddress = '0x0000000000000000000000000000000000000000';

exports.ZeroTxAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';

exports.EventHashMap = {
  TRANSFER: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  DTOKEN_SPLIT: "0x8adc8f535d46b08a2d88aa746c6d751130fde18f5f2d59b755f134099ca01457",
  DTOKEN_VOUCHER_MINTED: "0x80742bd15a2c8c4ad5d395bcf577073110e52f0c73bf980dfa9453c1d8c354e5",
  DTOKEN_VOUCHER_BURNED: "0x40f1d475c2aa44f5c23193fab26a64d6aa4e09ab51898b10a3036baf82398ea1",
  DTOKEN_TOKEN_LOCKED: "0xee1ecc2b21aa613cc77cd44823a68ef1168ce1f40c2eac1d68690baf955fdbd1",
  DTOKEN_TOKEN_UNLOCKED: "0x5ea3a5ca7f54881fdd7781894d69709e11027910f35647f9d4cc14e6872b6f72",
  DNC20_VOUCHER_MINTED: "0x5249cf5aa9f373a9fda5076a53abb87450615986fd25b4d701a153f8840eaf08",
  DNC20_VOUCHER_BURNED: "0x8cd7380d25c66046ede32c8a8089e2c5c5356ed48d6885bb3956f3a1bc4f030d",
  DNC20_TOKEN_LOCKED: "0xe5d8852bc02bf44f2a49b2d7722fa497ff83b689a28de1253304d2bc43d7b1cb",
  DNC20_TOKEN_UNLOCKED: "0x189b6301573b050cb7c350cae6d2d5c6262fda802e3b6cc69ee25eb35bdaa4eb",
  DNC721_VOUCHER_MINTED: "0x9b5e85947adbfffa61d52bc536966418240a4d92744deb02c50f02d031419c91",
  DNC721_VOUCHER_BURNED: "0xb097dcf0d8777f11a1ca4b2510f3df57029b1d2f8ce89a94ad11d4ca61df056e",
  DNC721_TOKEN_LOCKED: "0x4f9f4d5de31a3b62319d89542b16a804341d645cf6f3ddf2e28a03f7d227cb0b",
  DNC721_TOKEN_UNLOCKED: "0xf8a9006f96df65bd7b661f7c867ef002bd7c6efcae464f83b84095af188497dd",
  DNC1155_VOUCHER_MINTED: "0x4fbcffbdf5224654091654ad81a05e276525f0975fd62790b7876d1f7da75a53",
  DNC1155_VOUCHER_BURNED: "0x656ace729da14534acb1e9ea4ca34cf21501689c9ea0a8eff3aebca48f94f68e",
  DNC1155_TOKEN_LOCKED: "0x5ac6d27fa2bb13775fcf7bd9cc03a3f02063b2a2e484aaedc1b1c9d916874f36",
  DNC1155_TOKEN_UNLOCKED: "0x4a5b7552bbe9e70a8548f7bbc10edd823963920f052f3859337a36c45bf8bb1a"
}

exports.CommonEventABIs = {
  "0x8adc8f535d46b08a2d88aa746c6d751130fde18f5f2d59b755f134099ca01457": [{
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "seller", type: "address" },
    { indexed: false, internalType: "uint256", name: "sellerEarning", type: "uint256" },
    { indexed: true, internalType: "address", name: "platformFeeRecipient", type: "address" },
    { indexed: false, internalType: "uint256", name: "platformFee", type: "uint256" }],
    name: "DTokenSplit",
    type: "event"
  }],
  "0x80742bd15a2c8c4ad5d395bcf577073110e52f0c73bf980dfa9453c1d8c354e5": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "mintedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainTokenLockNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherMintNonce", "type": "uint256" }],
    "name": "DTokenVoucherMinted",
    "type": "event"
  }],
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": [{
    anonymous: false,
    inputs: [{ indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: false, name: 'value', type: 'uint256' }],
    name: 'Transfer',
    type: 'event'
  }, {
    anonymous: false,
    inputs: [{ indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: true, name: 'tokenId', type: 'uint256' }],
    name: 'Transfer',
    type: 'event'
  }],
  "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62": [{
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" },
    { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
    { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }],
    "name": "TransferSingle",
    "type": "event"
  }],
  "0x40f1d475c2aa44f5c23193fab26a64d6aa4e09ab51898b10a3036baf82398ea1": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainVoucherOwner", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "burnedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherBurnNonce", "type": "uint256" }],
    "name": "DTokenVoucherBurned",
    "type": "event"
  }],
  "0xee1ecc2b21aa613cc77cd44823a68ef1168ce1f40c2eac1d68690baf955fdbd1": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainTokenSender", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "targetChainID", "type": "uint256" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "lockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "tokenLockNonce", "type": "uint256" }],
    "name": "DTokenTokenLocked",
    "type": "event"
  }],
  "0x5ea3a5ca7f54881fdd7781894d69709e11027910f35647f9d4cc14e6872b6f72": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "unlockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainVoucherBurnNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "tokenUnlockNonce", "type": "uint256" }],
    "name": "DTokenTokenUnlocked",
    "type": "event"
  }],
  "0x5249cf5aa9f373a9fda5076a53abb87450615986fd25b4d701a153f8840eaf08": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "voucherContract", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "mintedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainTokenLockNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherMintNonce", "type": "uint256" }],
    "name": "DNC20VoucherMinted",
    "type": "event"
  }],
  "0x8cd7380d25c66046ede32c8a8089e2c5c5356ed48d6885bb3956f3a1bc4f030d": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainVoucherOwner", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "burnedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherBurnNonce", "type": "uint256" }],
    "name": "DNC20VoucherBurned",
    "type": "event"
  }],
  "0xe5d8852bc02bf44f2a49b2d7722fa497ff83b689a28de1253304d2bc43d7b1cb": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainTokenSender", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "targetChainID", "type": "uint256" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "lockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
    { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" },
    { "indexed": false, "internalType": "uint8", "name": "decimals", "type": "uint8" },
    { "indexed": false, "internalType": "uint256", "name": "tokenLockNonce", "type": "uint256" }],
    "name": "DNC20TokenLocked",
    "type": "event"
  }],
  "0x189b6301573b050cb7c350cae6d2d5c6262fda802e3b6cc69ee25eb35bdaa4eb": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "unlockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainVoucherBurnNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "tokenUnlockNonce", "type": "uint256" }],
    "name": "DNC20TokenUnlocked",
    "type": "event"
  }],
  "0x9b5e85947adbfffa61d52bc536966418240a4d92744deb02c50f02d031419c91": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "voucherContract", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainTokenLockNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherMintNonce", "type": "uint256" }],
    "name": "DNC721VoucherMinted",
    "type": "event"
  }],
  "0xb097dcf0d8777f11a1ca4b2510f3df57029b1d2f8ce89a94ad11d4ca61df056e": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainVoucherOwner", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherBurnNonce", "type": "uint256" }],
    "name": "DNC721VoucherBurned",
    "type": "event"
  }],
  "0x4f9f4d5de31a3b62319d89542b16a804341d645cf6f3ddf2e28a03f7d227cb0b": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainTokenSender", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "targetChainID", "type": "uint256" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
    { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" },
    { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" },
    { "indexed": false, "internalType": "uint256", "name": "tokenLockNonce", "type": "uint256" }],
    "name": "DNC721TokenLocked",
    "type": "event"
  }],
  "0xf8a9006f96df65bd7b661f7c867ef002bd7c6efcae464f83b84095af188497dd": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainVoucherBurnNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "tokenUnlockNonce", "type": "uint256" }],
    "name": "DNC721TokenUnlocked",
    "type": "event"
  }],
  "0x4fbcffbdf5224654091654ad81a05e276525f0975fd62790b7876d1f7da75a53": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "voucherContract", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "mintedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainTokenLockNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherMintNonce", "type": "uint256" }],
    "name": "DNC1155VoucherMinted",
    "type": "event"
  }],
  "0x656ace729da14534acb1e9ea4ca34cf21501689c9ea0a8eff3aebca48f94f68e": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainVoucherOwner", "type": "address" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "burnedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "voucherBurnNonce", "type": "uint256" }],
    "name": "DNC1155VoucherBurned",
    "type": "event"
  }],
  "0x5ac6d27fa2bb13775fcf7bd9cc03a3f02063b2a2e484aaedc1b1c9d916874f36": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "sourceChainTokenSender", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "targetChainID", "type": "uint256" },
    { "indexed": false, "internalType": "address", "name": "targetChainVoucherReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "lockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" },
    { "indexed": false, "internalType": "uint256", "name": "tokenLockNonce", "type": "uint256" }],
    "name": "DNC1155TokenLocked",
    "type": "event"
  }],
  "0x4a5b7552bbe9e70a8548f7bbc10edd823963920f052f3859337a36c45bf8bb1a": [{
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "string", "name": "denom", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "targetChainTokenReceiver", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "tokenID", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "unlockedAmount", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "sourceChainVoucherBurnNonce", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "tokenUnlockNonce", "type": "uint256" }],
    "name": "DNC1155TokenUnlocked",
    "type": "event"
  }]
}