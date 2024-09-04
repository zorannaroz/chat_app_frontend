/*

import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { v4 as uuidv4 } from "uuid";
import "./ChatRoom.css";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const connectWebSocket = (retries = 0) => {
    const maxRetries = 5;
    const retryDelay = Math.min(1000 * 2 ** retries, 30000); // Exponential backoff

    const username = import.meta.env.VITE_WS_USERNAME;
    const password = import.meta.env.VITE_WS_PASSWORD;
    const wsUrl = `ws://localhost:3001?username=${username}&password=${password}`;

    console.log("Attempting to connect to WebSocket:", wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnected(true);
      retries = 0; // Reset retries on successful connection
    };

    ws.current.onmessage = (event) => {
      handleMessage(event);
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket error occurred:", event.message || event);
      setIsConnected(false);
    };

    ws.current.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      setIsConnected(false);
      if (retries < maxRetries) {
        setTimeout(() => connectWebSocket(retries + 1), retryDelay);
      }
    };
  };

  const handleMessage = (event) => {
    const data = event.data;
    if (data) {
      if (typeof data === "string") {
        try {
          const message = JSON.parse(data);
          if (message && message.text && message.text.trim() !== '') {
            if (!message.id) {
              message.id = uuidv4();
            }
            setMessages((prevMessages) => {
              // Check for duplicates
              const existingMessage = prevMessages.find(m => m.id === message.id);
              if (!existingMessage) {
                return [...prevMessages, message];
              }
              return prevMessages;
            });
          }
        } catch (error) {
          console.error("Error parsing message as JSON:", error);
        }
      } else if (data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          try {
            const message = JSON.parse(text);
            if (message && message.text && message.text.trim() !== '') {
              if (!message.id) {
                message.id = uuidv4();
              }
              setMessages((prevMessages) => {
                // Check for duplicates
                const existingMessage = prevMessages.find(m => m.id === message.id);
                if (!existingMessage) {
                  return [...prevMessages, message];
                }
                return prevMessages;
              });
            }
          } catch (error) {
            console.error("Error parsing Blob message:", error);
          }
        };
        reader.readAsText(data);
      } else {
        console.error("Unexpected data type:", typeof data);
      }
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  const addMessage = (text) => {
    const newMessage = {
      id: uuidv4(),
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(newMessage));
    } else {
      console.error("WebSocket is not open. Ready state:", ws.current ? ws.current.readyState : "No WebSocket instance");
    }
  };

  return (
    <div className="chat-room">
      <MessageList messages={messages} />
      <MessageInput addMessage={addMessage} />
      {!isConnected && <div className="status">Disconnected. Reconnecting...</div>}
    </div>
  );
};

export default ChatRoom;




*/

/*
import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { v4 as uuidv4 } from "uuid";
import "./ChatRoom.css";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [userIcons, setUserIcons] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const userId = useRef(null); // Add a ref for user ID

  const connectWebSocket = () => {
    const username = import.meta.env.VITE_WS_USERNAME;
    const password = import.meta.env.VITE_WS_PASSWORD;
    const wsUrl = `ws://localhost:3001?username=${username}&password=${password}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data) {
        try {
          const message = JSON.parse(data);
          console.log("Received message:", message);
          
          if (message.userId) {
            console.log(`Message from user ID: ${message.userId}`);
          }

          switch (message.type) {
            case 'icon':
            case 'userJoined':
              console.log("User icon updated:", message.username, message.icon);
              setUserIcons((prevIcons) => ({
                ...prevIcons,
                [message.username]: message.icon,
              }));
              if (message.userId) {
                userId.current = message.userId; // Save user ID
              }
              break;
            case 'userLeft':
              setUserIcons((prevIcons) => {
                const { [message.username]: _, ...rest } = prevIcons;
                return rest;
              });
              break;
            default:
              if (message.text && message.text.trim() !== "") {
                if (!message.id) {
                  message.id = uuidv4();
                }
                setMessages((prevMessages) => {
                  const existingMessage = prevMessages.find(
                    (m) => m.id === message.id
                  );
                  if (!existingMessage) {
                    return [...prevMessages, message];
                  }
                  return prevMessages;
                });
              }
              break;
          }
        } catch (error) {
          console.error("Error parsing message as JSON:", error);
        }
      }
    };

    ws.current.onerror = (event) => {
      setIsConnected(false);
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  const addMessage = (text) => {
    const newMessage = {
      id: uuidv4(),
      text,
      timestamp: new Date().toLocaleTimeString(),
      userId: userId.current, // Include user ID in message
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log(`Sending message from user ID: ${userId.current}`);
      ws.current.send(JSON.stringify(newMessage));
    }
  };

  return (
    <div className="chat-room">
      <MessageList messages={messages} userIcons={userIcons} />
      <MessageInput addMessage={addMessage} />
      {!isConnected && (
        <div className="status">Disconnected. Reconnecting...</div>
      )}
    </div>
  );
};

export default ChatRoom;




*/



import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { v4 as uuidv4 } from "uuid";
import "./ChatRoom.css";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [userIcons, setUserIcons] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const username = import.meta.env.VITE_WS_USERNAME;
    const password = import.meta.env.VITE_WS_PASSWORD;
    const wsUrl = `ws://localhost:3001?username=${username}&password=${password}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data) {
        try {
          const message = JSON.parse(data);
          console.log("Received message:", message);
          
          switch (message.type) {
            case 'icon':
            case 'userJoined':
              console.log("User icon updated:", message.username, message.icon);
              setUserIcons((prevIcons) => ({
                ...prevIcons,
                [message.username]: message.icon,
              }));
              break;
            case 'userLeft':
              setUserIcons((prevIcons) => {
                const { [message.username]: _, ...rest } = prevIcons;
                return rest;
              });
              break;
            default:
              if (message.text && message.text.trim() !== "") {
                if (!message.id) {
                  message.id = uuidv4();
                }
                setMessages((prevMessages) => {
                  const existingMessage = prevMessages.find(
                    (m) => m.id === message.id
                  );
                  if (!existingMessage) {
                    return [...prevMessages, message];
                  }
                  return prevMessages;
                });
              }
              break;
          }
        } catch (error) {
          console.error("Error parsing message as JSON:", error);
        }
      }
    };

    ws.current.onerror = () => {
      setIsConnected(false);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  const addMessage = (text) => {
    const newMessage = {
      id: uuidv4(),
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(newMessage));
    }
  };

  return (
    <div className="chat-room">
      <MessageList messages={messages} userIcons={userIcons} />
      <MessageInput addMessage={addMessage} />
      {!isConnected && (
        <div className="status">Disconnected. Reconnecting...</div>
      )}
    </div>
  );
};

export default ChatRoom;


