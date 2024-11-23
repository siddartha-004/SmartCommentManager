// ChatApp.js
import React from 'react';
import Sidebar from './Sidebar';
import {useState} from 'react';
import ChatWindow from './ChatWindow';
import './ChatApp.css';
const ChatApp = () => {
  const [load,setload]=useState(true);
  const changeload=()=>{
    setload(!load);
  }
  
  return (
    <div className="chat-app">
      <ChatWindow changeload={changeload}/>
      <Sidebar load={load} />
    </div>
  );
};

export default ChatApp;
