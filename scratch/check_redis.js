import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_DB_URL);

async function check() {
    const key = 'audit:suzanne-desrosiers-professional-corporation';
    console.log(`Checking Redis key: ${key}`);
    const val = await redis.get(key);
    if (val) {
        const data = JSON.parse(val);
        console.log("Cached Audit Results found!");
        console.log("Firm:", data.firmName);
        console.log("Total Score:", data.summary?.totalScore);
        console.log("Gap %:", data.summary?.gapPercentage);
        
        console.log("\nSome Signal Scores:");
        [1, 2, 4, 31, 23].forEach(num => {
            const res = data.signals[num];
            console.log(`Signal ${num}: ${res?.score} - ${res?.note}`);
        });
    } else {
        console.log("Key not found in Redis.");
    }
    process.exit();
}

check();
