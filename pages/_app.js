import '../styles/global.css'
import CustomCursor from './components/customCursor/CustomCursor'
import TunnelBackground from './components/TunnelBackground'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <TunnelBackground />
      <CustomCursor />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp