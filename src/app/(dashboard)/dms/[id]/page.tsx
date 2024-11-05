"use client";

// This file displays all the messages from and to a user.

import { useMutation, useQuery } from "convex/react";
import { use, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, SendIcon, TrashIcon } from "lucide-react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<"directMessages"> }>;
}) {
  const { id } = use(params);

  const directMessage = useQuery(api.functions.dm.get, { id });

  const messages = useQuery(api.functions.message.list, { directMessage: id });

  if (!directMessage) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        {/** Display your profile icon. */}
        <Avatar className="size-8 border">
          <AvatarImage src={directMessage.user.image} />
          <AvatarFallback />
        </Avatar>
        {/** Display your name. */}
        <h1 className="font-semibold">{directMessage.user.username}</h1>
      </header>
      <ScrollArea className="h-full py-4">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <MessageInput directMessage={id} />
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];

// Message component which represents one message.
function MessageItem({ message }: { message: Message }) {
  return (
    <div className="flex items-center px-4 gap-2 py-2">
      {/** Render the avatar of the user who sent the message. */}
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender?.image} />}
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col mr-auto">
        {/** Render the name of the user who sent the message. */}
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        {/** Render the message that was sent. */}
        <p className="text-sm">{message.content}</p>
      </div>
      <MessageActions message={message} />
    </div>
  );
}

function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  const removeMutation = useMutation(api.functions.message.remove);

  if (!user || message.sender?._id !== user._id) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/** ... dots */}
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => removeMutation({ id: message._id })}
        >
          {/** Option do delete a message */}
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Input component for typing in your message and sending it.
function MessageInput({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.functions.message.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await sendMessage({ directMessage, content });
      setContent("");
    } catch (error) {
      toast.error("Failed to send message.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
    <form className="flex items-center p-4 gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button size="icon">
        <SendIcon />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
