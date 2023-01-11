interface Message {
    type: string;
    data: unknown;
}

export default class EthereumEvents
{
    SubscribeAccountChange(callback: (account: string) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.on('accountsChanged', callback);    
        }
    }

    UnsubscribeAccountChange(callback: (account: string) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.removeListener('chainChanged', callback);    
        }
    }

    SubscribeChainChange(callback: (networkId: string) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.on('chainChanged', callback);    
        }
    }

    UnsubscribeChainChange(callback: (networkId: string) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.removeListener('chainChanged', callback);    
        }
    }

    SubscribeBlockchainMessage(callback: (message: Message) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.on('message', callback);    
        }
    }

    UnsubscribeBlockchainMessage(callback: (message: Message) => void): void
    {
        const provider = (window as any).ethereum;
        if (provider)
        {
            provider.removeListener('message', callback);    
        }
    }

}