"use client";

// This file displays all the messages from and to a user.

import { useMutation, useQuery } from "convex/react";
import React, { use, useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

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
      <TypingIndicator directMessage={id} />
      <MessageInput directMessage={id} />
    </div>
  );
}

// Component to display typing indicator.
function TypingIndicator({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  // Fetch the usernames who are currently typing.
  const usernames = useQuery(api.functions.typing.list, { directMessage });

  if (!usernames || usernames.length === 0) {
    return null;
  }

  // Return div that says the user(s) are typing.
  return (
    <div className="text-sm text-muted-foreground px-4 py-2">
      {usernames.join(", ")} is typing...
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
        {/** If there is a message attachement, display the image. */}
        {message.attachment && (
          <Image
            src={message.attachment}
            alt="Attachment"
            width={300}
            height={300}
            className="rounded border overflow-hidden"
          />
        )}
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
  const sendTypingIndicator = useMutation(api.functions.typing.upsert);
  const generateUploadUrl = useMutation(
    api.functions.message.generateUploadUrl
  );
  const [attachment, setAttachment] = useState<Id<"_storage">>();
  const [file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);
  // Ref to link the input to the button.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Take the file.
    const file = e.target.files?.[0];

    if (!file) return;

    // Otherwise...
    setFile(file);
    setIsUploading(true);
    // ...generate the url...
    const url = await generateUploadUrl();
    // ...upload the file
    const res = await fetch(url, {
      method: "POST",
      body: file,
    });
    // ... and store the storage ID.
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    setAttachment(storageId);
    // Reset isUploading.
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await sendMessage({ directMessage, attachment, content });
      // Reset the content (ie the input box), the file and the attachment.
      setContent("");
      setAttachment(undefined);
      setFile(undefined);
    } catch (error) {
      toast.error("Failed to send message.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
    <>
      <form className="flex items-end p-4 gap-2" onSubmit={handleSubmit}>
        {/** Button to select an attachment. */}
        <Button
          type="button"
          size="icon"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <PlusIcon />
          <span className="sr-only">Attach</span>
        </Button>
        <div className="flex flex-col flex-1 gap-2">
          {/** Image preview */}
          {file && <ImagePreview file={file} isUploading={isUploading} />}

          <Input
            placeholder="Message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              // Trigger typing indicator.
              if (content.length > 0) {
                sendTypingIndicator({ directMessage });
              }
            }}
          />
        </div>
        <Button size="icon">
          <SendIcon />
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        // Handle when the file is selected.
        // Generate the upload URL, post the file to that URL, and
        // then get the storage ID.  Defined as a separate function as
        // opposed to onChange={(e) => {}}
        onChange={handleImageUpload}
      />
    </>
  );
}

// Component to display preview of image attachement once selected.
function ImagePreview({
  file,
  isUploading,
}: {
  file: File;
  isUploading: boolean;
}) {
  return (
    <div className="relative size-40 rounded border overflow-hidden">
      <Image
        src={URL.createObjectURL(file)}
        alt="Attachment"
        width={300}
        height={300}
      />
      {/** If the file was selected, show loading spiral. */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <LoaderIcon className="animate-spin size-8" />
        </div>
      )}
    </div>
  );
}
