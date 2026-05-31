// functions/index.js
// Firebase Cloud Function: Daily Price Tracker (Boilerplate)
// Deploy with: firebase deploy --only functions
//
// Cron schedule: every 24 hours
// exports.priceTrackerCron = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.priceTrackerCron = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    console.log("[PriceTracker] Cron started");

    try {
      const wishlistSnap = await db.collection("wishlist").get();
      console.log(`[PriceTracker] Found ${wishlistSnap.size} wishlist items`);

      for (const doc of wishlistSnap.docs) {
        const data = doc.data();
        const product = data.product;

        // TODO: Scrape / API-call untuk cek harga terkini dari Tokopedia/Shopee
        // const currentPrice = await fetchCurrentPrice(product.name, product.tokopedia_url);

        // TODO: Bandingkan dengan product.price_min (harga rekomendasi)
        // const savedMinPrice = parseInt(product.price_min.replace(/[^0-9]/g, ""));
        // if (currentPrice < savedMinPrice) {
        //   // Kirim notifikasi ke user melalui Firebase Cloud Messaging (FCM)
        //   // atau simpan ke collection "notifications" untuk ditampilkan di UI
        //   await db.collection("notifications").add({
        //     userId: data.userId,
        //     title: `Harga ${product.name} turun!`,
        //     message: `Harga sekarang Rp ${currentPrice.toLocaleString("id-ID")}, sebelumnya ${product.price_min}`,
        //     productName: product.name,
        //     createdAt: admin.firestore.FieldValue.serverTimestamp(),
        //     read: false
        //   });
        // }

        console.log(`[PriceTracker] Checked: ${product.name} - ${product.price_min}`);
      }

      console.log("[PriceTracker] Cron completed successfully");
      return null;
    } catch (error) {
      console.error("[PriceTracker] Error:", error);
      return null;
    }
  });
