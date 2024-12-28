import { useContext } from "react";
import GlobalContext from "./context/reducer/global";
import { EPage } from "./context/type";
import GameRoom from "./pages/game-room";
import Lobby from "./pages/lobby";
import Layout from "./components/layout";

function App() {
  const { page } = useContext(GlobalContext);
  return <Layout>{page === EPage.GAME_ROOM ? <GameRoom /> : <Lobby />}</Layout>;
}

export default App;
