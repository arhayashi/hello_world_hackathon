import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import HomePage from "./pages/HomePage"
import JoinPage from "./pages/JoinPage"
import ChatPage from "./pages/ChatPage"
import SessionPage from "./pages/SessionPage"


const App = () => {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    console.log(path)
    if (path === '/session') {
      window.electronAPI.setWindowAttributes({ opacity: 0.5 })
      console.log(path === '/chat')
    } else {
      window.electronAPI.setWindowAttributes({ opacity: 1 })
    }
  }, [location])
  return (
    <>
    <Routes>
        <Route path = "/" element={<HomePage/>} />
        <Route path = "/join" element={<JoinPage/>}/>
        <Route path = "/chat/:join_code" element={<ChatPage/>}/>
        <Route path = "/session" element={<SessionPage/>}/>
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
