/**
 * EVM Chain Faucet Server
 * A configurable faucet server that can be used with any EVM-compatible chain.
 * Features:
 * - Rate limiting by IP and wallet address
 * - Redis-based cooldown system
 * - Configurable drip amount
 * - Supports any EVM chain via Alchemy (or other providers)
 */

const express = require('express');
const { ethers } = require('ethers');
const Redis = require('redis');
const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(requestIp.mw());

// Initialize Redis client
// Note: Make sure Redis is running and accessible
const redis = Redis.createClient({ 
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' 
});
redis.connect().catch(console.error);

// Configure rate limiting
// This limits how many requests an IP can make per minute
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: process.env.RATE_LIMIT || 5 // Limit each IP to 5 requests per window
});
app.use(limiter);

// Configure blockchain provider and wallet
// Note: Use your own RPC URL and private key
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Faucet endpoint
app.post('/drip', async (req, res) => {
    try {
        const { address } = req.body;
        const userIp = req.clientIp;

        // Validate Ethereum address
        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // Check address cooldown
        const lastDripAddress = await redis.get(`address:${address}`);
        if (lastDripAddress) {
            const cooldownHours = process.env.COOLDOWN_HOURS || 48;
            return res.status(429).json({ 
                error: `Address in cooldown. Please wait ${cooldownHours} hours between requests.` 
            });
        }

        // Check IP cooldown
        const lastDripIp = await redis.get(`ip:${userIp}`);
        if (lastDripIp) {
            const cooldownHours = process.env.COOLDOWN_HOURS || 48;
            return res.status(429).json({ 
                error: `IP in cooldown. Please wait ${cooldownHours} hours between requests.` 
            });
        }

        console.log('Sending tokens to:', address);
        
        // Send transaction
        const tx = await wallet.sendTransaction({
            to: address,
            value: ethers.parseEther(process.env.DRIP_AMOUNT || '0.01')
        });
        console.log('Transaction hash:', tx.hash);

        // Set cooldowns
        const cooldownSeconds = (process.env.COOLDOWN_HOURS || 48) * 60 * 60;
        await redis.set(`address:${address}`, 'true', 'EX', cooldownSeconds);
        await redis.set(`ip:${userIp}`, 'true', 'EX', cooldownSeconds);

        res.json({ success: true, transaction: tx.hash });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: String(error) });
    }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Faucet server running on port ${PORT}`)); 