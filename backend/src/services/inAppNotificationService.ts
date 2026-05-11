import InAppNotification from "../models/InAppNotification";
import User from "../models/User";
import Phone from "../models/Phone";
import PriceHistory from "../models/PriceHistory";

const PRICE_DROP_THRESHOLD_PERCENT = 20;

export const getNotificationsForUser = async (firebaseUid: string) => {
    return await InAppNotification.find({ userId: firebaseUid })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
};

export const getUnreadNotificationCount = async (firebaseUid: string) => {
    return await InAppNotification.countDocuments({
        userId: firebaseUid,
        isRead: false,
    });
};

export const markNotificationAsRead = async (firebaseUid: string, notificationId: string) => {
    return await InAppNotification.findOneAndUpdate(
        { _id: notificationId, userId: firebaseUid },
        { $set: { isRead: true } },
        { new: true },
    ).lean();
};

export const markAllNotificationsAsRead = async (firebaseUid: string) => {
    return await InAppNotification.updateMany(
        { userId: firebaseUid, isRead: false },
        { $set: { isRead: true } },
    );
};

export const createPriceDropNotificationsForPhone = async (phoneId: string) => {
    const history = await PriceHistory.find({ phoneId }).sort({ recordedAt: 1 }).lean();

    if (history.length < 2) {
        return { created: 0, reason: "not enough price history" };
    }

    const previous = history[history.length - 2];
    const latest = history[history.length - 1];

    if (!previous.amount || !latest.amount || previous.amount <= 0) {
        return { created: 0, reason: "invalid price data" };
    }

    const dropPercent = ((previous.amount - latest.amount) / previous.amount) * 100;

    if (dropPercent < PRICE_DROP_THRESHOLD_PERCENT) {
        return { created: 0, reason: "drop below threshold" };
    }

    const phone = await Phone.findOne({ id: phoneId }).select({ id: 1, name: 1 }).lean();
    const phoneName = phone?.name || phoneId;

    const users = await User.find({
        wishlist: phoneId,
        "preferences.notifications.priceAlerts": true,
    }).lean();

    let created = 0;

    for (const user of users) {
        const duplicate = await InAppNotification.findOne({
            userId: user.firebaseUid,
            type: "price_drop",
            phoneId,
            "metadata.newPrice": latest.amount,
        }).lean();

        if (duplicate) continue;

        await InAppNotification.create({
            userId: user.firebaseUid,
            type: "price_drop",
            title: "Price Drop Alert",
            message: `${phoneName} dropped ${dropPercent.toFixed(1)}% from $${previous.amount} to $${latest.amount}.`,
            phoneId,
            isRead: false,
            metadata: {
                oldPrice: previous.amount,
                newPrice: latest.amount,
                dropPercent,
            },
        });

        created++;
    }

    return { created, dropPercent };
};