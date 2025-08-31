# 🐼 PumpPanda - Recall Trading Competition Agent

A powerful multi-blockchain meme token trading bot designed specifically for the Recall Trading Competition. This agent combines advanced AI-powered trading strategies with cross-chain portfolio management to hunt and trade the hottest meme tokens across multiple blockchains.

## 🏆 Competition Features

- **Multi-Blockchain Trading**: Trade on Ethereum, Base, BSC, Polygon, Arbitrum, and Optimism
- **AI-Powered Strategy Engine**: Advanced algorithms with recall memory for optimal trade decisions
- **Meme Token Hunter**: Automatically detect and trade trending meme tokens
- **Cross-Chain Portfolio Management**: Unified portfolio tracking across all networks
- **Risk Management**: Built-in stop-loss, position limits, and cross-chain protection
- **Performance Analytics**: Comprehensive reporting and performance tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Multi-blockchain wallets with private keys
- RPC access (Infura, Alchemy, QuickNode, etc.)
- Gas fees for each blockchain

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd recall-agent

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

1. **Set Environment Variables** (create a `.env` file):
```bash
# Infura Project ID
INFURA_PROJECT_ID=your_infura_project_id

# Blockchain Private Keys (optional, can be set in config)
ETHEREUM_PRIVATE_KEY=your_eth_private_key
BASE_PRIVATE_KEY=your_base_private_key
BSC_PRIVATE_KEY=your_bsc_private_key
POLYGON_PRIVATE_KEY=your_polygon_private_key
```

2. **Configure Blockchains** (edit `config/pump-panda-config.json`):
```json
{
  "blockchains": {
    "ethereum": {
      "enabled": true,
      "network": "mainnet",
      "rpcUrl": "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      "privateKey": "YOUR_ETH_PRIVATE_KEY",
      "gasLimit": 300000,
      "gasPrice": "20000000000"
    },
    "base": {
      "enabled": true,
      "network": "mainnet",
      "rpcUrl": "https://mainnet.base.org",
      "privateKey": "YOUR_BASE_PRIVATE_KEY",
      "gasLimit": 300000,
      "gasPrice": "1000000000"
    }
  }
}
```

### Running the Agent

#### Start the Trading Agent
```bash
# Start the main PumpPanda agent
npm run pump-panda
```

#### Run Demo
```bash
# Run the full demo
npm run demo

# Run configuration demo only
npm run demo:config
```

#### Development Mode
```bash
# Run in development mode
npm run dev
```

## 🎯 Trading Strategy

### Meme Token Hunting
The agent automatically scans for trending meme tokens across all enabled blockchains:

- **Trending Tokens**: PEPE, SHIB, DOGE, FLOKI, BALD, TOSHI, SAFEMOON, BABYDOGE
- **Scan Interval**: Configurable (default: 60 seconds)
- **Auto-Trading**: Can be enabled/disabled for automatic buying/selling
- **Risk Filters**: Market cap, liquidity, and blacklist/whitelist filtering

### Multi-Chain Strategy
- **Cross-Chain Arbitrage**: Identifies price differences across blockchains
- **Chain-Specific DEXs**: Optimized DEX selection for each blockchain
- **Gas Optimization**: Smart gas price management for cost efficiency

### Risk Management
- **Position Limits**: Maximum exposure per token, chain, and DEX
- **Stop-Loss**: Automatic stop-loss at configurable percentages
- **Take-Profit**: Profit-taking at target levels
- **Circuit Breaker**: Emergency stop-loss for portfolio protection

## 📊 Performance Monitoring

### Real-Time Metrics
- Portfolio value across all chains
- PnL tracking per token and chain
- Gas usage and cost analysis
- Trade execution statistics

### Reporting
- Performance reports every 5 minutes
- Daily and weekly summaries
- Risk metrics and alerts
- Portfolio rebalancing recommendations

## 🔧 Configuration Options

### Trading Parameters
```json
{
  "trading": {
    "tradingInterval": 30000,
    "maxPositionSize": 1000,
    "maxDailyLoss": 100,
    "maxDrawdown": 0.05,
    "stopLossPercentage": 0.02,
    "takeProfitPercentage": 0.04,
    "maxOpenPositions": 5
  }
}
```

### Risk Parameters
```json
{
  "risk": {
    "maxExposurePerToken": 0.1,
    "maxExposurePerChain": 0.3,
    "maxExposurePerDex": 0.2,
    "emergencyStopLoss": 0.15,
    "circuitBreaker": true
  }
}
```

### Meme Token Hunting
```json
{
  "memeTokenHunting": {
    "enabled": true,
    "scanInterval": 60000,
    "minMarketCap": "1000000",
    "minLiquidity": "500000",
    "maxHoldings": 10,
    "autoBuy": false,
    "autoSell": false
  }
}
```

## 🛡️ Security Features

- **Private Key Protection**: Never committed to repository
- **Environment Variables**: Secure configuration management
- **Transaction Validation**: Built-in safety checks
- **Rate Limiting**: Prevents excessive API calls
- **Error Handling**: Graceful failure and recovery

## 📈 Supported Blockchains & Tokens

### Ethereum
- **DEXs**: Uniswap V3, Sushiswap
- **Tokens**: PEPE, SHIB, DOGE, FLOKI, WETH, USDC, USDT, DAI
- **Network**: Mainnet & Sepolia Testnet

### Base
- **DEXs**: BaseSwap, Uniswap V3
- **Tokens**: BALD, TOSHI, WETH, USDC, USDbC
- **Network**: Mainnet & Sepolia Testnet

### BSC (Binance Smart Chain)
- **DEXs**: PancakeSwap V3, BiSwap
- **Tokens**: SAFEMOON, BABYDOGE, MOONSHOT, WBNB, BUSD, USDT
- **Network**: Mainnet & Testnet

### Polygon
- **DEXs**: QuickSwap, Uniswap V3
- **Tokens**: POLYPEPE, MATICDOGE, WMATIC, USDC, USDT, DAI
- **Network**: Mainnet & Mumbai Testnet

## 🔍 API Integration

The agent integrates with various APIs for market data:

- **Price Feeds**: CoinGecko, CoinMarketCap, DEX aggregators
- **Social Sentiment**: Twitter, Reddit, Telegram trending
- **On-Chain Data**: DEX analytics, liquidity pools, trading volume
- **News Sources**: Crypto news APIs for market sentiment

## 📝 Usage Examples

### Basic Trading Agent
```typescript
import { PumpPandaAgent } from './src/core/PumpPandaAgent';
import { PumpPandaConfigManager } from './src/config/PumpPandaConfigManager';

async function startTrading() {
  const config = new PumpPandaConfigManager();
  await config.load();
  
  const agent = new PumpPandaAgent(config);
  await agent.initialize();
  await agent.start();
}

startTrading();
```

### Custom Configuration
```typescript
// Update trending tokens
await agent.updateTrendingTokens(['PEPE', 'SHIB', 'DOGE', 'FLOKI']);

// Enable auto-trading
await agent.enableAutoTrading(true);

// Get agent status
const status = await agent.getStatus();
console.log('Portfolio Value:', status.portfolio.totalValue);
```

### Portfolio Management
```typescript
// Get current portfolio state
const portfolio = await agent.getStatus().portfolio;

// Monitor specific chains
const ethValue = portfolio.chains.ethereum.totalValue;
const baseValue = portfolio.chains.base.totalValue;

console.log(`Ethereum: $${ethValue}, Base: $${baseValue}`);
```

## 🚨 Important Notes

### For Competition Use
1. **Test First**: Always test on testnets before mainnet
2. **Start Small**: Begin with small position sizes
3. **Monitor Closely**: Keep an eye on performance and risk metrics
4. **Backup Configs**: Keep backup copies of your configuration
5. **Gas Management**: Monitor gas costs across different chains

### Risk Warnings
- **High Volatility**: Meme tokens are extremely volatile
- **Liquidity Risk**: Some tokens may have low liquidity
- **Smart Contract Risk**: Always verify token contracts
- **Gas Costs**: High gas fees can eat into profits
- **Market Timing**: Success depends heavily on market timing

## 🆘 Troubleshooting

### Common Issues
1. **RPC Connection Failed**: Check RPC URLs and network connectivity
2. **Insufficient Gas**: Ensure adequate gas fees for transactions
3. **Private Key Error**: Verify private key format and permissions
4. **DEX Integration Issues**: Check DEX contract addresses and versions

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run pump-panda
```

### Support
- Check the logs in the `logs/` directory
- Review configuration settings
- Test individual components with demo scripts
- Check blockchain network status

## 🏁 Competition Strategy Tips

1. **Multi-Chain Diversification**: Spread risk across multiple blockchains
2. **Trend Following**: Focus on trending tokens with high social engagement
3. **Liquidity Management**: Prioritize tokens with good liquidity
4. **Risk Control**: Use stop-losses and position sizing
5. **Performance Tracking**: Monitor metrics and adjust strategies
6. **Gas Optimization**: Choose optimal times for transactions

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This software is for educational and competition purposes. Trading cryptocurrencies involves substantial risk. Use at your own risk and never invest more than you can afford to lose.

---

**🐼 PumpPanda - Hunting the next 100x meme token across all blockchains! 🚀**

*Built for the Recall Trading Competition with ❤️*
