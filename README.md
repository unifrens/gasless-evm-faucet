# Unichain Sepolia/EVM Chain Faucet Server

A configurable faucet server that can be used with any EVM-compatible blockchain. This server includes rate limiting, IP-based cooldowns, and Redis-based persistence.

## Live Demo

[Claim 0.01 Unichain Sepolia Testnet ETH here](https://www.unifrens.com/faucet)  
`https://www.unifrens.com/faucet`

## Features

- 🔒 Rate limiting by IP address
- ⏲️ Cooldown periods for both wallet addresses and IPs
- 💧 Configurable drip amount
- 🔌 Support for any EVM-compatible chain
- 🚀 Built with Express.js for high performance
- 📊 Redis-based persistence for cooldown tracking

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- Access to an EVM-compatible RPC endpoint (e.g., Alchemy, Infura)
- A wallet with funds for the faucet

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd faucet-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   PORT=3002
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
   PRIVATE_KEY=your_private_key_here
   DRIP_AMOUNT=0.01
   RATE_LIMIT=5
   COOLDOWN_HOURS=48
   REDIS_URL=redis://localhost:6379
   ```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3002 |
| RPC_URL | Your blockchain RPC endpoint | - |
| PRIVATE_KEY | Private key for the faucet wallet (without 0x prefix) | - |
| DRIP_AMOUNT | Amount of tokens to send per request (in native currency) | 0.01 |
| RATE_LIMIT | Maximum requests per IP per minute | 5 |
| COOLDOWN_HOURS | Hours to wait between requests from the same IP/address | 48 |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |

## Running the Server

### Development
```bash
node index.js
```

### Production
For production, we recommend using PM2:

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Start the server:
   ```bash
   pm2 start index.js --name "faucet-server"
   ```

3. Save PM2 process list and generate startup script:
   ```bash
   pm2 save
   pm2 startup
   ```

## API Endpoint

### POST /drip

Request tokens from the faucet.

**Request Body:**
```json
{
    "address": "0x..."
}
```

**Success Response:**
```json
{
    "success": true,
    "transaction": "0x..."
}
```

**Error Responses:**
- 400: Invalid address
- 429: Rate limit or cooldown period
- 500: Server error

## Security Considerations

1. **Private Key**: Never commit your private key to version control. Always use environment variables.
2. **Rate Limiting**: Adjust `RATE_LIMIT` and `COOLDOWN_HOURS` based on your needs and token value.
3. **RPC Provider**: Use a reliable RPC provider with good uptime.
4. **Redis Security**: Ensure your Redis instance is properly secured and not exposed to the public.

## Production Deployment

For production deployment, we recommend:

1. Using a reverse proxy (like Nginx) for SSL termination
2. Setting up proper monitoring and alerting
3. Implementing additional security measures
4. Regular backups of Redis data
5. Using a process manager like PM2

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this code for your own faucet! 
