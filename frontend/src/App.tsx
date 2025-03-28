import { Navigate, Route, Routes } from "react-router-dom";
import useZustand from "./zustand/useStore";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Navbar from "./components/Navbar";

function App() {
  const { nickname } = useZustand();
  return (
    <>
      <div className="fixed -z-10 min-h-screen w-full bg-[url(/bg.jpg)]" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/room/:roomCode"
          element={nickname.length > 0 ? <Game /> : <Navigate to={"/"} />}
        />
        <Route
          path="/home"
          element={nickname.length > 0 ? <Home /> : <Navigate to={"/"} />}
        />
      </Routes>
    </>
  );
}

export default App;
