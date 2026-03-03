import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatPage />}>
          <Route path=":agentId" element={<ChatPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
