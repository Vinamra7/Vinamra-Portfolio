import Head from 'next/head';
import { useState, useEffect } from 'react';
import AboutMe from './components/AboutMe';
import HomeSection from "./components/HomeSection";

export default function Home({ showContent }) {

  return (
    <>
      <Head>
        <title>Vinamra's Portfolio</title>
        <meta name="description" content="Your portfolio description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen w-screen flex flex-col">
        <HomeSection showContent={showContent}/>
        <AboutMe showContent={showContent} />
      </main>
    </>
  );
}
