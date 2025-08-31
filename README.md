# 🐼 PumpPanda - Multi-Blockchain Meme Token Trading Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Enabled-orange.svg)](https://ethereum.org/)
[![Base](https://img.shields.io/badge/Base-Enabled-blue.svg)](https://base.org/)
[![BSC](https://img.shields.io/badge/BSC-Enabled-yellow.svg)](https://bscscan.com/)
[![Polygon](https://img.shields.io/badge/Polygon-Enabled-purple.svg)](https://polygon.technology/)

> **Advanced AI-powered trading bot for the Recall Trading Competition with multi-blockchain meme token hunting capabilities**

## 🚀 Features

- **🤖 AI-Powered Strategy Engine** - Advanced algorithms with recall memory for optimal trade decisions
- **⛓️ Multi-Blockchain Support** - Ethereum, Base, BSC, Polygon, Arbitrum, Optimism
- **🎯 Meme Token Hunting** - Automated detection and trading of trending meme tokens
- **📊 Cross-Chain Portfolio Management** - Unified portfolio tracking across networks
- **🛡️ Risk Management** - Built-in stop-loss, position limits, and cross-chain protection
- **📈 Performance Analytics** - Comprehensive reporting and performance tracking
- **⚙️ Configuration Management** - Centralized blockchain, trading, and agent settings

## 🏆 Competition Ready

Built specifically for the **Recall Trading Competition** with:
- Advanced recall memory systems
- Multi-chain arbitrage capabilities
- Real-time market data processing
- Automated risk management
- Performance optimization algorithms

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pump-panda-trading-agent.git
cd pump-panda-trading-agent

# Install dependencies
npm install

# Copy environment template
cp env.template .env

# Edit .env with your configuration
# Add your Infura Project ID and private keys
```

### Configuration

1. **Set up your `.env` file:**
```bash
# Required: Infura Project ID
INFURA_PROJECT_ID=your_infura_project_id_here

# Optional: Blockchain Private Keys (can also be set in config file)
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key_here
BASE_PRIVATE_KEY=your_base_private_key_here
BSC_PRIVATE_KEY=your_bsc_private_key_here
POLYGON_PRIVATE_KEY=your_polygon_private_key_here
```

2. **Edit `config/pump-panda-config.json`** with your preferred settings

### Running the Agent

```bash
# Run in development mode
npm run dev

# Run the main agent
npm run pump-panda

# Run demo
npm run demo

# Run tests
npm run test:pump-panda

# Build for production
npm run build
npm start
```

## 📁 Project Structure

```
recall-agent/
├── src/
│   ├── core/           # Core agent logic
│   ├── config/         # Configuration management
│   ├── blockchain/     # Blockchain interactions
│   ├── dex/           # DEX integrations
│   ├── market/        # Market data management
│   ├── strategy/      # Trading strategies
│   ├── risk/          # Risk management
│   ├── portfolio/     # Portfolio tracking
│   ├── memory/        # Recall memory system
│   ├── performance/   # Performance analytics
│   ├── utils/         # Utility functions
│   └── examples/      # Example scripts
├── config/            # Configuration files
├── tests/             # Test files
├── docs/              # Documentation
└── scripts/           # Build and deployment scripts
```

## 🔧 Configuration

### Blockchain Settings
- **Ethereum**: Mainnet with Uniswap V3
- **Base**: Mainnet with Baseswap
- **BSC**: Mainnet with PancakeSwap V3
- **Polygon**: Mainnet with QuickSwap
- **Arbitrum**: Mainnet with Uniswap V3
- **Optimism**: Mainnet with Velodrome

### Trading Parameters
- **Trading Interval**: 30 seconds
- **Max Position Size**: $1,000
- **Stop Loss**: 2%
- **Take Profit**: 4%
- **Max Daily Loss**: $100
- **Max Drawdown**: 5%

### Meme Token Hunting
- **Scan Interval**: 60 seconds
- **Min Market Cap**: $1M
- **Min Liquidity**: $500K
- **Max Holdings**: 10 tokens
- **Auto Buy/Sell**: Enabled

## 📊 Performance Metrics

The agent tracks comprehensive performance metrics including:
- Total return and percentage
- Sharpe ratio
- Maximum drawdown
- Win rate and profit factor
- Average win/loss
- Best/worst trades
- Total trade count

## 🛡️ Risk Management

- **Position Limits**: Maximum exposure per token (10%)
- **Chain Limits**: Maximum exposure per blockchain (30%)
- **DEX Limits**: Maximum exposure per DEX (20%)
- **Emergency Stop Loss**: 15% portfolio loss trigger
- **Circuit Breaker**: Automatic trading halt on extreme losses
- **Gas Price Limits**: Maximum gas price controls

## 🔍 Meme Token Detection

The agent automatically scans for trending meme tokens using:
- Social media sentiment analysis
- Trading volume spikes
- Price momentum indicators
- Community growth metrics
- Liquidity changes

## 📈 Supported DEXs

| Blockchain | Primary DEX | Secondary DEX |
|------------|-------------|---------------|
| Ethereum   | Uniswap V3  | Sushiswap     |
| Base       | Baseswap    | Uniswap V3    |
| BSC        | PancakeSwap | Biswap        |
| Polygon    | QuickSwap   | Uniswap V3    |
| Arbitrum   | Uniswap V3  | Sushiswap     |
| Optimism   | Velodrome   | Uniswap V3    |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:pump-panda

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (Coming Soon)
```bash
docker build -t pump-panda .
docker run -d --name pump-panda-agent pump-panda
```

## 📚 Documentation

- [Configuration Guide](docs/CONFIGURATION.md)
- [API Reference](docs/API.md)
- [Trading Strategies](docs/STRATEGIES.md)
- [Risk Management](docs/RISK_MANAGEMENT.md)
- [Performance Analysis](docs/PERFORMANCE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**This software is for educational and research purposes only. Use at your own risk.**

- Trading cryptocurrencies involves substantial risk
- Past performance does not guarantee future results
- Always test thoroughly before using real funds
- Never invest more than you can afford to lose

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/pump-panda-trading-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/pump-panda-trading-agent/discussions)
- **Wiki**: [Project Wiki](https://github.com/YOUR_USERNAME/pump-panda-trading-agent/wiki)

## 🙏 Acknowledgments

- Built for the Recall Trading Competition
- Inspired by advanced AI trading systems
- Community contributions and feedback
- Open source blockchain tools and libraries

---

**🐼 PumpPanda - Where AI Meets Meme Token Trading**

*Built with ❤️ for the crypto community*
