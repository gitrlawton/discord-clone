// Build a messages UI that we can connect to our database.
"use client";

import { useState } from "react";

interface Message {
  sender: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Alice", content: "Hello, world!" },
    { sender: "Bob", content: "Hi, Alice" },
  ]);

  const [input, setInput] = useState("");

  // Callback for our Form.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Prevents the page from refreshing upon submit.
    event.preventDefault();
    // Set the messages to all the existing messages plus a new one
    // containing the content we just sent.
    setMessages([...messages, { sender: "Alice", content: input }]);
    // Reset the input to an empty string.
    setInput("");
  };

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          id="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
