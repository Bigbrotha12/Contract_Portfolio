import WalletConnectProvider from "@walletconnect/web3-provider";
import Chains from "../Constants/Chains";

//  Create WalletConnect Provider
const provider = new WalletConnectProvider({
  rpc: {
    1: Chains[1].rpc,
    5: Chains[5].rpc,
    80001: Chains[80001].rpc
  }
});

// Return a provider
async function WalletConnect() {

  if(!provider.connected) {
    // Enable session (triggers QR Code modal)
    // Returns array of accounts available
    await provider.enable();
    return provider;
  } else {
    alert("Already connected");
    console.log("Connected Accounts: ", provider.accounts[0]);
    return provider;
  }
}

export default WalletConnect;

// Provider Object
// accounts: ['0x1ADC923a317C35e9e964A52B690B7dabb7e9d29A']
// bridge: "https://bridge.walletconnect.org"
// chainId: 1
// connectCallbacks: []
// connected: true
// currentBlock: {number: Uint8Array(3), hash: Uint8Array(32), parentHash: Uint8Array(32), nonce: Uint8Array(8), mixHash: Uint8Array(32), …}
// enable: async () => {…}
// http: HTTPConnection {_events: Events, _eventsCount: 2, url: 'https://mainnet.infura.io/v3/28b12f61dabf41379c84687973179f02'}
// infuraId: ""
// isConnecting: false
// networkId: undefined
// onConnect: (callback) => {…}
// qrcode: true
// qrcodeModal: {open: ƒ, close: ƒ}
// qrcodeModalOptions: undefined
// request: async (payload) => {…}
// rpc: {1: 'https://mainnet.infura.io/v3/28b12f61dabf41379c84687973179f02', 5: 'https://goerli.infura.io/v3/28b12f61dabf41379c84687973179f02', 80001: 'https://polygon-mumbai.g.alchemy.com/v2/M2gbwLQB-tQY0OGgGxVt_EHuTszdyLVk'}
// rpcUrl: "https://mainnet.infura.io/v3/28b12f61dabf41379c84687973179f02"
// send: async (payload, callback) => {…}
// triggerConnect: (result) => {…}
// wc: WalletConnect {protocol: 'wc', version: 1, _bridge: 'https://7.bridge.walletconnect.org', _key: ArrayBuffer(32), _clientId: '7bf34d32-dd80-4840-abd6-aaf4913ceef2', …}
// _blockTracker: PollingBlockTracker {_events: {…}, _eventsCount: 5, _maxListeners: undefined, _blockResetDuration: 8000, _currentBlock: '0xec316f', …}
// _events: {block: Array(3), start: Array(3), stop: Array(3)}
// _eventsCount: 3
// _maxListeners: 30
// _providers: (7) [FixtureProvider, BlockCacheSubprovider, SubscriptionsSubprovider, SubscriptionsSubprovider, NonceTrackerSubprovider, HookedWalletSubprovider, {…}]
// _ready: Stoplight {_events: {…}, _eventsCount: 0, _maxListeners: undefined, isLocked: false}
// _running: true

