import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }) {
  return  (
    <>
    <Component {...pageProps} />;
    <SpeedInsights />
    <Analytics />
    </>
  );

}



// src/pages/_app.js