import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import HomePage from "./pages/HomePage"
import JoinPage from "./pages/JoinPage"
import ChatPage from "./pages/ChatPage"


const App = () => {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname

    if (path === '/chat') {
      window.electronAPI?.setWindowAttributes({
        opacity: 0.5,
        title: 'Have a Question?',
      })
    } else if (path === '/join'){
      window.electronAPI?.setWindowAttributes({
        opacity: 1,
        title: 'Join a Session'
      })
    } else if (path === '/') {
      window.electronAPI?.setWindowAttributes({
        opacity: 1,
        title: 'Home'
      })
    }
  }, [location])
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
