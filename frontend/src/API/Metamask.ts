import detectEthereumProvider from '@metamask/detect-provider';

// Return a provider
async function MetamaskConnect(): Promise<any | null> {
    // Detect Metamask provider
    const provider = await detectEthereumProvider();

    // provider == window.ethereum || null
    if(provider) {
        try {
            await (provider as any).request({ method: 'eth_requestAccounts' });
            return provider;
        } catch (error) {
            if ((error as any).code === 4001) {
                alert("Metamask: User rejected request");
                return null;
            } else {
                console.error(error);
                return null;
            }
        }
    } else {
        alert("Error: Metamask not detected.");
        return null;
    }
}

export default MetamaskConnect;

// Provider object
// chainId: "0x5"
// enable: ƒ ()
// isMetaMask: true
// networkVersion: "5"
// request: ƒ ()
// selectedAddress: "0xf8c15b9fe37581867e398dc8f13720b478abe582"
// send: ƒ ()
// sendAsync: ƒ ()
// _events: {connect: ƒ}
// _eventsCount: 1
// _handleAccountsChanged: ƒ ()
// _handleChainChanged: ƒ ()
// _handleConnect: ƒ ()
// _handleDisconnect: ƒ ()
// _handleStreamDisconnect: ƒ ()
// _handleUnlockStateChanged: ƒ ()
// _jsonRpcConnection: {events: s, stream: d, middleware: ƒ}
// _log: u {name: undefined, levels: {…}, methodFactory: ƒ, getLevel: ƒ, setLevel: ƒ, …}
// _maxListeners: 100
// _metamask: Proxy {isUnlocked: ƒ, requestBatch: ƒ}
// _rpcEngine: o {_events: {…}, _eventsCount: 0, _maxListeners: undefined, _middleware: Array(3)}
// _rpcRequest: ƒ ()
// _sendSync: ƒ ()
// _sentWarnings: {enable: false, experimentalMethods: false, send: false, events: {…}}
// _state: {accounts: Array(1), isConnected: true, isUnlocked: true, initialized: true, isPermanentlyDisconnected: false}
// _warnOfDeprecation: ƒ ()