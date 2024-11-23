import React, { useState, useEffect, useRef } from 'react';
import { Popover } from 'antd';
import './ChatWindow.css';

const ChatWindow = ({changeload}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [spamWarning, setSpamWarning] = useState(""); 
    const textareaRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/messages');
                const data = await response.json();
                console.log(data)
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, []);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    const handleSend = async () => {
        if (message.trim() === "") {
            setPopoverVisible(true);
            return;
        }

        setPopoverVisible(false);

        try {
            // // Step 1: Check if the message is spam
            const spamCheckResponse = await fetch('http://127.0.0.1:5000/api/check_spam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message }),
            });
            const spamCheckData = await spamCheckResponse.json();
            console.log(spamCheckData)

            if (spamCheckData!="0") {
                setSpamWarning("This message has been blocked due to community guidelines. Please revise.");
                return;
            }

            // Step 2: Classify the message
            const response = await fetch('http://127.0.0.1:5000/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message }),
            });
            const data = await response.json();
            if(data.type=="question"){
                changeload();
            }
            setMessages((prevMessages) => [...prevMessages, data]);
            setMessage("");
            setSpamWarning("");
            textareaRef.current.style.height = "auto";
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://127.0.0.1:5000/api/messages/${id}`, { method: 'DELETE' });
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const hidePopover = () => {
        setPopoverVisible(false);
    };

    const closeSpamWarning = () => {
        setSpamWarning(""); 
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>John Doe</h3>
            </div>
            <div className="chat-messages">
    {messages.length === 0 ? (
        <div className="start-commenting" style={{'color':'red'}}> 
            <p>Start commenting!</p>
        </div>
    ) : (
        messages.map((msg) => (
            <div
                key={msg.id}
                className={`message ${msg.type === "question" ? "sent" : "received"}`}
                style={{ backgroundColor: msg.type === "question" ? "#FFA500" : "#1e90ff" }}
            >
                <p>{msg.text}</p>
            </div>
        ))
    )}
</div>


            {/* Spam warning message */}
            {spamWarning && (
                <div className="spam-warning">
                    <span>{spamWarning}</span>
                    <button className="close-button" onClick={closeSpamWarning}>×</button>
                </div>
            )}

            <div className="chat-input" style={{ marginBottom: '10px' }}>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    rows="1"
                    className="message-input"
                    style={{ resize: 'none', minHeight: '38px' }}
                />
                <Popover
                    content={<a onClick={hidePopover} style={{ color: 'red' }}>Please enter a message.</a>}
                    trigger="click"
                    open={popoverVisible}
                    onOpenChange={(visible) => setPopoverVisible(visible && message.trim() === "")}
                >
                    <button className="send-button" onClick={handleSend}>Send</button>
                </Popover>
            </div>
        </div>
    );
};

export default ChatWindow;
