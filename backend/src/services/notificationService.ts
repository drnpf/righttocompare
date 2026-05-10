import Phone from "../models/Phone";
import PriceHistory from "../models/PriceHistory";
import { IUser } from "../models/User";
import * as UserService from "./userService";
import { isEmailServiceConfigured, sendEmail } from "./emailService";

const DIGEST_TIMEZONE = "America/Los_Angeles";
const DIGEST_HOUR_PT = 9;
const DIGEST_MINUTE_PT = 0;
const DIGEST_CHECK_INTERVAL_MS = 15 * 60 * 1000;
const PRICE_DROP_THRESHOLD_PERCENT = 20;

interface PriceDropItem {
  phoneId: string;
  phoneName: string;
  originalPrice: number;
  salePrice: number;
  percentDrop: number;
}

interface ReleaseItem {
  phoneId: string;
  phoneName: string;
  releaseDate: Date;
  price: number;
}

interface DigestPayload {
  priceDrops: PriceDropItem[];
  newReleases: ReleaseItem[];
}

const formatDateKeyInTimeZone = (date: Date, timeZone: string): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatPercent = (percent: number): string => `${percent.toFixed(1)}%`;

const isDigestAlreadySentToday = (user: IUser, todayKey: string): boolean => {
  const sentAt = user.notificationState?.dailyDigestLastSentAt;
  if (!sentAt) return false;
  return formatDateKeyInTimeZone(new Date(sentAt), DIGEST_TIMEZONE) === todayKey;
};

const shouldCheckPriceAlerts = (user: IUser): boolean => {
  return (
    user.preferences.notificationChannels.email &&
    user.preferences.notifications.priceAlerts &&
    user.wishlist.length > 0
  );
};

const shouldCheckNewReleases = (user: IUser): boolean => {
  return user.preferences.notificationChannels.email && user.preferences.notifications.newReleases;
};

const buildPriceDropItems = async (user: IUser): Promise<PriceDropItem[]> => {
  if (!shouldCheckPriceAlerts(user)) return [];

  const phoneIds = [...new Set(user.wishlist)];
  const rows = await PriceHistory.find({ phoneId: { $in: phoneIds } }).sort({ phoneId: 1, recordedAt: 1 }).lean();

  const historyByPhoneId = new Map<string, typeof rows>();
  for (const row of rows) {
    const currentRows = historyByPhoneId.get(row.phoneId) || [];
    currentRows.push(row);
    historyByPhoneId.set(row.phoneId, currentRows);
  }

  const phones = await Phone.find({ id: { $in: phoneIds } }).select({ _id: 0, id: 1, name: 1 }).lean();
  const phoneNameById = new Map(phones.map((phone) => [phone.id, phone.name]));

  const items: PriceDropItem[] = [];

  for (const phoneId of phoneIds) {
    const history = historyByPhoneId.get(phoneId);
    if (!history || history.length < 2) continue;

    const oldest = history[0];
    const latest = history[history.length - 1];

    if (!Number.isFinite(oldest.amount) || !Number.isFinite(latest.amount) || oldest.amount <= 0) {
      continue;
    }

    const percentDrop = ((oldest.amount - latest.amount) / oldest.amount) * 100;
    if (percentDrop < PRICE_DROP_THRESHOLD_PERCENT) continue;

    items.push({
      phoneId,
      phoneName: phoneNameById.get(phoneId) || phoneId,
      originalPrice: oldest.amount,
      salePrice: latest.amount,
      percentDrop,
    });
  }

  return items.sort((a, b) => b.percentDrop - a.percentDrop);
};

const buildNewReleaseItems = async (todayKey: string): Promise<ReleaseItem[]> => {
  const phones = await Phone.find().select({ _id: 0, id: 1, name: 1, releaseDate: 1, price: 1 }).lean();

  return phones
    .filter((phone) => formatDateKeyInTimeZone(new Date(phone.releaseDate), DIGEST_TIMEZONE) === todayKey)
    .map((phone) => ({
      phoneId: phone.id,
      phoneName: phone.name,
      releaseDate: new Date(phone.releaseDate),
      price: phone.price,
    }))
    .sort((a, b) => a.phoneName.localeCompare(b.phoneName));
};

const buildDigestPayload = async (user: IUser, todayKey: string): Promise<DigestPayload> => {
  const [priceDrops, allNewReleases] = await Promise.all([
    buildPriceDropItems(user),
    shouldCheckNewReleases(user) ? buildNewReleaseItems(todayKey) : Promise.resolve([]),
  ]);

  return {
    priceDrops,
    newReleases: allNewReleases,
  };
};

const buildEmailContent = (
  user: IUser,
  payload: DigestPayload,
  allowEmpty: boolean
): { subject: string; text: string; html: string } | null => {
  const hasPriceDrops = payload.priceDrops.length > 0;
  const hasNewReleases = payload.newReleases.length > 0;

  if (!allowEmpty && !hasPriceDrops && !hasNewReleases) {
    return null;
  }

  const greetingName = user.displayName || user.email.split("@")[0] || "there";
  const subjectParts: string[] = [];
  if (hasPriceDrops) subjectParts.push("Wishlist price drops");
  if (hasNewReleases) subjectParts.push("New releases");
  const subject =
    subjectParts.length > 0
      ? `Right to Compare Daily Digest: ${subjectParts.join(" + ")}`
      : "Right to Compare Daily Digest (Test)";

  const priceDropText = hasPriceDrops
    ? payload.priceDrops
        .map(
          (item) =>
            `- ${item.phoneName}: ${formatCurrency(item.originalPrice)} -> ${formatCurrency(item.salePrice)} (${formatPercent(item.percentDrop)} drop)`
        )
        .join("\n")
    : "No wishlist phones currently meet the 20% drop threshold.";

  const newReleaseText = hasNewReleases
    ? payload.newReleases
        .map((item) => `- ${item.phoneName}: releases today at ${formatCurrency(item.price)}`)
        .join("\n")
    : "No new phone releases today.";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Here is your Right to Compare daily digest.",
    "",
    "Wishlist Price Drops",
    priceDropText,
    "",
    "New Releases",
    newReleaseText,
  ].join("\n");

  const priceDropHtml = hasPriceDrops
    ? `<ul>${payload.priceDrops
        .map(
          (item) =>
            `<li><strong>${item.phoneName}</strong>: ${formatCurrency(item.originalPrice)} -> ${formatCurrency(item.salePrice)} (${formatPercent(item.percentDrop)} drop)</li>`
        )
        .join("")}</ul>`
    : "<p>No wishlist phones currently meet the 20% drop threshold.</p>";

  const newReleaseHtml = hasNewReleases
    ? `<ul>${payload.newReleases
        .map(
          (item) =>
            `<li><strong>${item.phoneName}</strong>: releases today at ${formatCurrency(item.price)}</li>`
        )
        .join("")}</ul>`
    : "<p>No new phone releases today.</p>";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e1e1e; line-height: 1.5;">
      <p>Hi ${greetingName},</p>
      <p>Here is your Right to Compare daily digest.</p>
      <h2>Wishlist Price Drops</h2>
      ${priceDropHtml}
      <h2>New Releases</h2>
      ${newReleaseHtml}
    </div>
  `;

  return { subject, text, html };
};

export const sendUserNotificationDigest = async (
  user: IUser,
  options?: { forceSend?: boolean; allowEmpty?: boolean; now?: Date }
): Promise<{ sent: boolean; reason?: string; payload?: DigestPayload }> => {
  if (!user.preferences.notificationChannels.email) {
    return { sent: false, reason: "email channel disabled" };
  }

  if (!isEmailServiceConfigured()) {
    return { sent: false, reason: "email service not configured" };
  }

  const now = options?.now || new Date();
  const todayKey = formatDateKeyInTimeZone(now, DIGEST_TIMEZONE);

  if (!options?.forceSend && isDigestAlreadySentToday(user, todayKey)) {
    return { sent: false, reason: "digest already sent today" };
  }

  const payload = await buildDigestPayload(user, todayKey);
  const emailContent = buildEmailContent(user, payload, options?.allowEmpty ?? false);

  if (!emailContent) {
    return { sent: false, reason: "no digest content", payload };
  }

  await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });

  if (!options?.forceSend || !isDigestAlreadySentToday(user, todayKey)) {
    await UserService.updateNotificationState(user.firebaseUid, {
      dailyDigestLastSentAt: now,
    });
  }

  return { sent: true, payload };
};

export const sendDailyNotificationDigests = async (): Promise<{
  scannedUsers: number;
  sentDigests: number;
}> => {
  const users = await UserService.findAllUsers();
  let sentDigests = 0;

  for (const user of users) {
    const result = await sendUserNotificationDigest(user);
    if (result.sent) {
      sentDigests += 1;
    }
  }

  return {
    scannedUsers: users.length,
    sentDigests,
  };
};

const getTimePartsInTimeZone = (date: Date, timeZone: string): { hour: number; minute: number } => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value || 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value || 0),
  };
};

export const startDailyDigestScheduler = (): void => {
  if (!isEmailServiceConfigured()) {
    return;
  }

  const runIfWindowMatches = async () => {
    const now = new Date();
    const { hour, minute } = getTimePartsInTimeZone(now, DIGEST_TIMEZONE);
    const isDigestWindow = hour === DIGEST_HOUR_PT && minute >= DIGEST_MINUTE_PT && minute < DIGEST_MINUTE_PT + 15;

    if (!isDigestWindow) {
      return;
    }

    try {
      const result = await sendDailyNotificationDigests();
      console.log(
        `Daily notification digest completed. Sent ${result.sentDigests} digest(s) after scanning ${result.scannedUsers} user(s).`
      );
    } catch (error) {
      console.error("Daily notification digest failed:", error);
    }
  };

  setInterval(() => {
    runIfWindowMatches().catch((error) => {
      console.error("Daily notification digest interval failed:", error);
    });
  }, DIGEST_CHECK_INTERVAL_MS);

  setTimeout(() => {
    runIfWindowMatches().catch((error) => {
      console.error("Initial daily notification digest check failed:", error);
    });
  }, 5000);
};
