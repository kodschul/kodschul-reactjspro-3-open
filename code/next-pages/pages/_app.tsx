import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { createGlobalStyle } from "styled-components";

const client = new QueryClient();

const GlobalStyle = createGlobalStyle({});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={client}>
      <GlobalStyle />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
