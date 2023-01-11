import { ethers } from "ethers";

export const Utils =
{
    formatNumber
}

function formatNumber(n: string | number): string
{
    try
    {
        return ethers.utils.commify(n);
    } catch (error)
    {
        console.log(error);
        return '';
    }
}