import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import HomePage from "./pages/HomePage"
import JoinPage from "./pages/JoinPage"
import ChatPage from "./pages/ChatPage"


const App = () => {
  return (
    <>
    <Routes>
        <Route path = "/" element={<ChatPage/>} />
        <Route path = "/join" element={<JoinPage/>}/>
        <Route path = "/chat" element={<ChatPage/>}/>
      </Routes>
    </>
      
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </StrictMode>
);
