import "./App.css";

import Home from "./pages/Home";

import { ThemeProvider } from "@mui/material/styles";

import { theme } from "./utils/createTheme";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";

import { configEnc } from "./services/local-storage/configEnc";

configEnc();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
