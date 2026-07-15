import { runAuditPipeline } from './src/lib/lawyers/server/signalPipeline.js';
import dotenv from 'dotenv';
dotenv.config();

const testData = {
    firmName: "Suzanne Desrosiers Professional Corporation",
    city: "Timmins",
    websiteUrl: "https://sdlawtimmins.com",
    linkedinUrl: "https://ca.linkedin.com/in/suzanne-desrosiers-63534891",
    facebookUrl: "https://www.facebook.com/suzannedesrosierslaw/",
    instagramUrl: "https://www.instagram.com/suzannedesrosierslaw/",
    yearsInBusiness: 26
};

async function test() {
    console.log("Starting debug audit...");
    try {
        const results = await runAuditPipeline(testData);
        console.log("Audit complete. Summary of scores:");
        Object.entries(results).forEach(([num, res]) => {
            console.log(`Signal ${num}: ${res.score} (${res.note})`);
        });
    } catch (err) {
        console.error("Audit failed:", err);
    }
}

test();
