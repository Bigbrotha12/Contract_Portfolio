import React from 'react';
import IController from '../../app/IController';
import Material from '../../assets/Material';
import EventItem from './EventItem';
import { ControllerContext } from '../../state/AppContext';
import { TransactionStatus } from '../../app/Definitions';

type Transaction = {
    status: TransactionStatus,
    hash: string
}

export default function EventTracker()
{
    const controller = React.useContext<IController>(ControllerContext);
    
    const useTransactionListener = () => {
        const [transactions, addTransactions] = React.useState<Array<Transaction>>([]);
        function handleTransactionEvent(type: TransactionStatus, hash: string): void {
            addTransactions((state) => {
                let newTx = { status: type, hash: hash };
                return [...state, newTx];
            }); 
        }
        React.useEffect(() => {
            controller.AddTransactionListener(handleTransactionEvent);
            return (() => { controller.RemoveTransactionListener() });
        });
        return transactions;
    };
    const transactions = useTransactionListener();

    return (
        <div className='ml-[12px] w-[30%]'>
            <Material.Card>
                <Material.CardHeader title="Event Tracker" />
                <Material.CardContent>
                {
                    transactions.map((tx) => {
                        return (
                            <EventItem key={tx.hash} status={tx.status} hash={tx.hash} />
                        )
                    })   
                }
                </Material.CardContent>
            </Material.Card>
        </div>
    )
}