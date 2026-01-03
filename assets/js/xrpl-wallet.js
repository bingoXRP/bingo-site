const XRPLWallet = (function() {
  const NFT_ISSUER = 'rsRX8g7fqisD4f4yeadSBdRPqr4JwHH5JM';
  const TOKEN_ISSUER = 'rf3CVf559UKrvzGD24PxXDcFYcG7h2ySyN';
  const TOKEN_CURRENCY = '42494E474F0000000000000000000000';
  const XRPL_RPC = 'https://s1.ripple.com:51234';
  
  let state = {
    connected: false,
    address: null,
    provider: null,
    nftCount: 0,
    hasToken: false,
    maxCards: 1
  };

  const providers = {
    xumm: {
      name: 'Xumm',
      detect: () => typeof window.xumm !== 'undefined',
      connect: async () => {
        if (!window.xumm) throw new Error('Xumm not installed');
        try {
          const result = await window.xumm.authorize();
          return result.me;
        } catch (err) {
          throw new Error('Xumm connection failed');
        }
      }
    },
    gem: {
      name: 'Gem Wallet',
      detect: () => typeof window.gemWallet !== 'undefined',
      connect: async () => {
        if (!window.gemWallet) throw new Error('Gem Wallet not installed');
        try {
          const result = await window.gemWallet.connect();
          return result.address;
        } catch (err) {
          throw new Error('Gem Wallet connection failed');
        }
      }
    },
    crossmark: {
      name: 'Crossmark',
      detect: () => typeof window.crossmark !== 'undefined',
      connect: async () => {
        if (!window.crossmark) throw new Error('Crossmark not installed');
        try {
          const result = await window.crossmark.connect();
          return result.address;
        } catch (err) {
          throw new Error('Crossmark connection failed');
        }
      }
    },
    joey: {
      name: 'Joey',
      detect: () => typeof window.joey !== 'undefined',
      connect: async () => {
        if (!window.joey) throw new Error('Joey not installed');
        try {
          const result = await window.joey.connect();
          return result.address;
        } catch (err) {
          throw new Error('Joey connection failed');
        }
      }
    }
  };

  function getAvailableWallets() {
    return Object.keys(providers).filter(key => providers[key].detect());
  }

  async function checkNFTBalance(address) {
    try {
      const response = await fetch(XRPL_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_nfts',
          params: [{
            account: address,
            ledger_index: 'validated'
          }]
        })
      });
      
      const data = await response.json();
      if (data.result && data.result.account_nfts) {
        const ourNFTs = data.result.account_nfts.filter(nft => nft.Issuer === NFT_ISSUER);
        return ourNFTs.length;
      }
      return 0;
    } catch (error) {
      console.error('NFT check failed:', error);
      return 0;
    }
  }

  async function checkTokenBalance(address) {
    try {
      const response = await fetch(XRPL_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_lines',
          params: [{
            account: address,
            ledger_index: 'validated'
          }]
        })
      });
      
      const data = await response.json();
      if (data.result && data.result.lines) {
        const bingoLine = data.result.lines.find(line => 
          line.account === TOKEN_ISSUER && 
          (line.currency === 'BINGO' || line.currency === TOKEN_CURRENCY)
        );
        return bingoLine ? parseFloat(bingoLine.balance) : 0;
      }
      return 0;
    } catch (error) {
      console.error('Token check failed:', error);
      return 0;
    }
  }

  function calculateMaxCards(nftCount) {
    if (nftCount === 0) return 1;
    return Math.min(nftCount, 3);
  }

  async function connect(providerName) {
    try {
      const provider = providers[providerName];
      if (!provider) throw new Error('Unknown wallet provider');
      if (!provider.detect()) throw new Error(`${provider.name} not installed`);

      const address = await provider.connect();
      
      const [nftCount, tokenBalance] = await Promise.all([
        checkNFTBalance(address),
        checkTokenBalance(address)
      ]);

      state.connected = true;
      state.address = address;
      state.provider = providerName;
      state.nftCount = nftCount;
      state.hasToken = tokenBalance > 0;
      state.maxCards = calculateMaxCards(nftCount);

      localStorage.setItem('xrpl_wallet', JSON.stringify({
        address,
        provider: providerName,
        timestamp: Date.now()
      }));

      return state;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  async function reconnect() {
    try {
      const saved = localStorage.getItem('xrpl_wallet');
      if (!saved) return false;

      const { address, provider, timestamp } = JSON.parse(saved);
      const age = Date.now() - timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('xrpl_wallet');
        return false;
      }

      const [nftCount, tokenBalance] = await Promise.all([
        checkNFTBalance(address),
        checkTokenBalance(address)
      ]);

      state.connected = true;
      state.address = address;
      state.provider = provider;
      state.nftCount = nftCount;
      state.hasToken = tokenBalance > 0;
      state.maxCards = calculateMaxCards(nftCount);

      return true;
    } catch (error) {
      console.error('Reconnect failed:', error);
      localStorage.removeItem('xrpl_wallet');
      return false;
    }
  }

  function disconnect() {
    state = {
      connected: false,
      address: null,
      provider: null,
      nftCount: 0,
      hasToken: false,
      maxCards: 1
    };
    localStorage.removeItem('xrpl_wallet');
  }

  function getState() {
    return { ...state };
  }

  function isConnected() {
    return state.connected;
  }

  function getMaxCards() {
    return state.maxCards;
  }

  function getAddress() {
    return state.address;
  }

  function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return {
    getAvailableWallets,
    connect,
    reconnect,
    disconnect,
    getState,
    isConnected,
    getMaxCards,
    getAddress,
    formatAddress,
    checkNFTBalance,
    checkTokenBalance
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = XRPLWallet;
}
