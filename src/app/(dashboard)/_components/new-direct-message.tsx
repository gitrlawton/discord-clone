// Create a DM.

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewDirectMessage() {
  // State to close the Add friend dialog modal.
  const [open, setOpen] = useState(false);
  const createDirectMessage = useMutation(api.functions.dm.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent the page from refreshing.
    e.preventDefault();

    try {
      const id = await createDirectMessage({
        username: e.currentTarget.username.value,
      });

      // Close the dialog modal.
      setOpen(false);
      // Redirect the user to the newly created DM thread.
      router.push(`/dms/${id}`);
    } catch (error) {
      toast.error("Failed to create direct message.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className="sr-only">New Direct Message</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Enter a username to start a new direct message.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" />
          </div>
          <DialogFooter>
            <Button>Start Direct Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
