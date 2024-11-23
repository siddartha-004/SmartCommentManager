import logo from './logo.svg';
import './App.css';
import ChatApp from './components/ChatApp';

function App() {
  return (
    <div className="App">
      <div className="blur" style={{ top: "-18%", right: "0" }}></div>
      <div className="blur" style={{ top: "36%", left: "-8rem" }}></div>
      <ChatApp/>
    </div>
  );
}

export default App;
