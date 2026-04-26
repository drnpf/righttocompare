import mongoose from "mongoose";
import dotenv from "dotenv";
import Phone from "../models/Phone";
import PriceHistory from "../models/PriceHistory";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const roundPrice = (num: number) => Math.round(num);

const generatePriceHistory = (currentPrice: number) => {
    const months = 6;
    const points: { amount: number; month: string; recordedAt: Date }[] = [];

    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);

        let priceVariation = 1 + (Math.random() * 0.2); // up to +20% older prices
        let amount = currentPrice * priceVariation;

        // slight randomness
        amount += (Math.random() - 0.5) * 50;

        // newest month = exact current price
        if (i === 0) {
            amount = currentPrice;
        }

        points.push({
            amount: roundPrice(amount),
            month: date.toLocaleString("default", { month: "short", year: "numeric" }),
            recordedAt: date,
        });
    }

    // ensure last point matches exactly
    points[points.length - 1].amount = roundPrice(currentPrice);

    return points;
};

const seed = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const phones = await Phone.find({});
        console.log(`Found ${phones.length} phones`);

        let totalInserted = 0;

        for (const phone of phones) {
            const currentPrice = Number(phone.price);

            if (!currentPrice || currentPrice <= 0) continue;

            const history = generatePriceHistory(currentPrice);

            const docs = history.map((h) => ({
                phoneId: phone.id,
                amount: h.amount,
                currency: "USD",
                source: "mock-seed",
                raw: `$${h.amount}`,
                recordedAt: h.recordedAt,
            }));

            await PriceHistory.insertMany(docs);
            totalInserted += docs.length;
        }

        console.log(`Inserted ${totalInserted} price history records`);

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();