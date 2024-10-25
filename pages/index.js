import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Your Portfolio</title>
        <meta name="description" content="Your portfolio description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/*<h1 style={{color:'white'}}>Welcome to My Portfolio</h1>*/}
          <p style={{color:'white', fontSize: '10em'}}>a
          a<br/>
          a b<br/>
          a b c<br/>
          a b c d<br/>
          a b c d e<br/>
          a b c d e f<br/>
          a b c d e f g<br/>
          a b c d e f g h<br/>
          a b c d e f g h i<br/>
          a b c d e f g h i j<br/>
          a b c d e f g h i j k<br/>
          a b c d e f g h i j k l<br/>
          a b c d e f g h i j k l m<br/>
          a b c d e f g h i j k l m n<br/>
          a b c d e f g h i j k l m n o<br/>
          a b c d e f g h i j k l m n o p<br/>
          a b c d e f g h i j k l m n o p q<br/>
          </p>
      </main>
    </>
  );
}