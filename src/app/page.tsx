// Build a messages UI that we can connect to our database.
"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const messages = useQuery(api.functions.message.list);
  const createMessage = useMutation(api.functions.message.create);

  const [input, setInput] = useState("");

  // Callback for our Form.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Prevents the page from refreshing upon submit.
    event.preventDefault();
    createMessage({ sender: "Alice", content: input });
    // Reset the input to an empty string.
    setInput("");
  };

  return (
    <div>
      {messages?.map((message, index) => (
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
