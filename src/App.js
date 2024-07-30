import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = 'https://tlnscxtyjdzmmiocoyjk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbnNjeHR5amR6bW1pb2NveWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIzNDY1NjgsImV4cCI6MjAzNzkyMjU2OH0.XhpZwYI1Piq8TtU4uwIdY8MbDIQ177DCei8aHP3A5mU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .from('messages')
      .on('INSERT', payload => {
        setMessages(messages => [...messages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('inserted_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const username = 'User'; // g
    const content = newMessage;

    const { error } = await supabase
      .from('messages')
      .insert([{ username, content }]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className="chat-message">
              <strong>{message.username}:</strong> {message.content}
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
      </div>
    </div>
  );
}

export default App;
