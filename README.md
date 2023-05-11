# ERC4883 Composable Snowman☃️

<p align="center">
<img src="snowman.svg" alt="Snowman" width="300">
</p>

[Snowman](https://snowman-mu.vercel.app/) is a composable NFT based on the ERC4883 standard which enables you to mint a snowman with dynamic attributes(sky color, wind direction which affects the snowfall direction, eye focus, e.t.c) and compose with other accessories(Hat🎩, Scarf🧣, e.t.c).

## How it works

### [Video Demo](https://www.youtube.com/watch?v=M6UHlhepcBo)

A user can mint a Snowman for 0.02 ETH. Then mint other accessories(NFTs). If the accessory has been allowed by the Snowman contract owner to be used for composition, the accessory can be transferred using `safeTransferFrom` to the Snowman NFT contract which triggers the `onERC721Received` function which then adds the accessory to the accessory owner's Snowman specified in the `bytes` param of the `safeTransferFrom` function. The `tokenURI` and the `renderTokenById` functions will then return the Snowman with it's accessories. Accessories can be removed by users at any time using the `removeAccessory` or `removeAllAccessories` functions.

`✍️Note: Users are allowed to create an accessory which will be added to the snowman if suitable... A Christmas Tree🎄 would be nice, wouldn't it?🙂`

# Local Development

### Install dependencies:

```shell
yarn
```

### Run unit tests:

```shell
yarn test
```

### Deploy contracts:

```shell
yarn deploy:sepolia
```

### Run frontend:

```shell
yarn start
```

# Acknowledgements

- [ScaffoldETH V2](https://github.com/scaffold-eth/se-2)
