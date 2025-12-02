import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ API কলগুলোকে Express সার্ভারে ফরওয়ার্ড করার জন্য কনফিগারেশন
  server: {
    // এই পোর্টটি (5173) ফ্রন্টএন্ডে ব্যবহার হবে
    proxy: {
      // যখনই ফ্রন্টএন্ড '/api' দিয়ে শুরু করে কোনো রিকোয়েস্ট করবে...
      "/api": {
        // ...তখন রিকোয়েস্টটি আপনার লাইভ ব্যাকএন্ড টার্গেটে পাঠিয়ে দেওয়া হবে।
        target: "http://localhost:5000",
        changeOrigin: true,
        // secure: false লাইনটি বাদ দেওয়া হলো, কারণ Render এর বৈধ SSL সার্টিফিকেট রয়েছে।
      },
    },
  },
});
