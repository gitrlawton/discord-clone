"use client";

// This file displays all the messages from and to a user.

import { useQuery } from "convex/react";
import { use } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const user = useQuery(api.functions.user.get);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        {/** Display your profile icon. */}
        <Avatar className="size-8 border">
          <AvatarImage src={user.image} />
          <AvatarFallback />
        </Avatar>
        {/** Display your name. */}
        <h1 className="font-semibold">{user.username}</h1>
      </header>
      <ScrollArea className="h-full py-4">
        <MessageItem />
      </ScrollArea>
    </div>
  );
}

// Message component which represents one message.
function MessageItem() {
  const user = useQuery(api.functions.user.get);

  return (
    <div className="flex items-center px-4 gap-2">
      {/** Render the avatar of the user who sent the message. */}
      <Avatar className="size-8 border">
        <AvatarImage src={user!.image} />
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col mr-auto">
        {/** Render the name of the user who sent the message. */}
        <p className="text-xs text-muted-foreground">{user!.username}</p>
        {/** Render the message that was sent. */}
        <p className="text-sm">Hello, world!</p>
      </div>
      <MessageActions />
    </div>
  );
}

function MessageActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/** ... dots */}
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-destructive">
          {/** Option do delete a message */}
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// List of messages.
