# Token Trading Guide for Recall Agent

This guide explains how to use your Recall Agent to trade tokens on the Sepolia testnet using Uniswap V3.

## Prerequisites

1. **Sepolia Testnet ETH**: You need Sepolia testnet ETH for gas fees
2. **Infura Account**: For RPC endpoint access
3. **Private Key**: Your wallet's private key for signing transactions
4. **Test Tokens**: Sepolia testnet tokens for trading

## Setup

### 1. Install Dependencies

```bash
cd recall-agent
npm install
```

### 2. Configure Blockchain Settings

Edit `config/sepolia-config.json`:

```json
{
  "blockchain": {
    "network": "sepolia",
    "rpcUrl": "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    "privateKey": "YOUR_PRIVATE_KEY_HERE",
    "gasLimit": 300000,
    "gasPrice": "20000000000"
  }
}
```

**Important**: Replace `YOUR_INFURA_PROJECT_ID` with your actual Infura project ID and `YOUR_PRIVATE_KEY_HERE` with your wallet's private key.

### 3. Get Sepolia Testnet ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get testnet ETH.

### 4. Get Test Tokens

You can get test tokens from:
- [Uniswap Sepolia](https://app.uniswap.org/swap?chain=sepolia)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

## Supported Tokens

The agent supports these tokens on Sepolia:

- **WETH**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`
- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **DAI**: `0x68194a729C2450ad26072b3D33ADaCbcef39D574`
- **LINK**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`

## Usage Examples

### Basic Token Trading

```typescript
import { ConfigManager } from './src/config/ConfigManager';
import { RecallAgent } from './src/core/RecallAgent';

async function tradeTokens() {
  // Initialize configuration
  const config = new ConfigManager();
  await config.load();
  
  // Initialize agent
  const agent = new RecallAgent(config);
  await agent.initialize();
  
  // Get portfolio manager
  const portfolio = (agent as any).portfolio;
  
  // Get supported tokens
  const tokens = portfolio.getSupportedTokens();
  
  // Get swap quote (1 WETH to USDC)
  const quote = await portfolio.getSwapQuote(
    tokens.WETH,
    tokens.USDC,
    '1000000000000000000' // 1 WETH (18 decimals)
  );
  
  console.log('Swap quote:', quote);
  
  // Execute swap (uncomment to actually trade)
  /*
  const txHash = await portfolio.swapTokens(
    tokens.WETH,
    tokens.USDC,
    '1000000000000000000', // 1 WETH
    '1800000000' // 1800 USDC minimum
  );
  
  console.log('Swap transaction:', txHash);
  */
}
```

### Running the Example

```bash
npm run dev src/examples/token-trading-example.ts
```

## Trading Strategies

### 1. Simple Token Swap

```typescript
// Swap WETH for USDC
const swapTx = await portfolio.swapTokens(
  tokens.WETH,
  tokens.USDC,
  '1000000000000000000', // 1 WETH
  '1800000000' // 1800 USDC minimum
);
```

### 2. Get Token Information

```typescript
// Get token details
const tokenInfo = await portfolio.getTokenInfo(tokens.USDC);
console.log('Token:', tokenInfo.name, tokenInfo.symbol);

// Get balance
const balance = await portfolio.getTokenBalance(tokens.USDC);
console.log('Balance:', balance);
```

### 3. Price Quotes

```typescript
// Get swap quote before trading
const quote = await portfolio.getSwapQuote(
  tokens.WETH,
  tokens.USDC,
  '1000000000000000000' // 1 WETH
);

console.log('Amount out:', quote.amountOut);
console.log('Price impact:', quote.priceImpact);
console.log('Gas estimate:', quote.gasEstimate);
```

## Risk Management

The agent includes built-in risk management:

- **Position Size Limits**: Configurable maximum position sizes
- **Stop Loss**: Automatic stop-loss orders
- **Take Profit**: Automatic take-profit orders
- **Daily Loss Limits**: Maximum daily loss protection
- **Drawdown Protection**: Maximum portfolio drawdown limits

## Monitoring

### Portfolio Status

```typescript
const status = await agent.getStatus();
console.log('Portfolio value:', status.portfolio.currentValue);
console.log('Total PnL:', status.portfolio.totalPnL);
console.log('Open positions:', status.portfolio.positions.length);
```

### Transaction History

All trades are logged and stored in memory for analysis and reporting.

## Safety Features

1. **Testnet Only**: Currently configured for Sepolia testnet
2. **Transaction Validation**: All trades are validated before execution
3. **Gas Estimation**: Automatic gas estimation for transactions
4. **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure you have enough Sepolia ETH for gas fees
2. **Insufficient Balance**: Check token balances before trading
3. **Slippage**: Set appropriate `amountOutMin` to avoid high slippage
4. **Network Issues**: Verify RPC endpoint connectivity

### Debug Mode

Enable detailed logging by setting log level in your configuration.

## Next Steps

1. **Test with Small Amounts**: Start with small test trades
2. **Monitor Performance**: Use the built-in performance tracking
3. **Customize Strategies**: Modify trading strategies based on your needs
4. **Add More Tokens**: Extend support for additional tokens
5. **Mainnet Deployment**: When ready, configure for mainnet

## Security Notes

- **Never share your private key**
- **Use testnet for development and testing**
- **Test thoroughly before mainnet deployment**
- **Keep your configuration files secure**

## Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review error messages in the console
3. Verify your configuration settings
4. Ensure sufficient testnet ETH balance

Happy trading! 🚀
