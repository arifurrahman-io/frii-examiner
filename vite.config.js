import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ API কলগুলোকে Express সার্ভারে ফরওয়ার্ড করার জন্য এই ব্লকটি যোগ করুন
  server: {
    // এই পোর্টটি (5173) ফ্রন্টএন্ডে ব্যবহার হবে
    proxy: {
      // যখনই ফ্রন্টএন্ড '/api' দিয়ে শুরু করে কোনো রিকোয়েস্ট করবে...
      "/api": {
        // ...তখন রিকোয়েস্টটি এই টার্গেটে (আপনার Express সার্ভার) পাঠিয়ে দেওয়া হবে।
        target: "https://frii-examiner-back.onrender.com",
        changeOrigin: true,
        secure: false, // HTTPS ব্যবহার না করলে false রাখুন
      },
    },
  },
});
