import NFTPriceData from "../model/nftPriceData";
import { vipnames } from "../nft/vipnames";

function nftPrice(username: string): NFTPriceData {
    let category = 3;
    if (username.length <= 5) category = 2;
    if (username.length <= 3) category = 1;
    if (vipnames.includes(username)) category = 0;

    let price: NFTPriceData = <NFTPriceData>{
        username: username,
        price: prices[category].price,
        currency: "usd",
        description: prices[category].description,
    };

    return price;
}

const prices = [
    {
        price: 999,
        description: "Exclusive Avatar NFT name",
    },
    {
        price: 99,
        description: "Short Avatar NFT Name",
    },
    {
        price: 49,
        description: "Short Avatar NFT name",
    },
    {
        price: 19,
        description: "Avatar NFT name",
    },
];

export { nftPrice };
