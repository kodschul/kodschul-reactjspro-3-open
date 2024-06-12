import logo from "../logo.svg";
import "../App.css";
import Characters from "./Characters";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <QueryClientProvider client={queryClient}>
          <Characters />
        </QueryClientProvider>
      </header>
    </div>
  );
}

export default App;
