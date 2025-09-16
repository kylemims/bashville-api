import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { ApplicationViews } from "./ApplicationViews";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navbar />
          <main>
            <ApplicationViews />
          </main>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
