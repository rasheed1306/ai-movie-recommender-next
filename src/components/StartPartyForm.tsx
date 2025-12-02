"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

const formSchema = z.object({
  partyName: z.string().min(3, "Party name must be at least 3 characters"),
  userName: z.string().min(2, "Your name must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

async function createSession(data: FormData): Promise<{ partyCode: string, sessionUserId: string }> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create party.");
  }

  return response.json();
}

export function StartPartyForm() {
  const router = useRouter();
  const { session } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { partyName: "", userName: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      // Save host's session user ID to localStorage (for Quiz component)
      if (data.sessionUserId) {
        localStorage.setItem("sessionUserID", data.sessionUserId);
      }

      toast.success("Party created successfully! 🥳");
      router.push(`/party/${data.partyCode}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  const isButtonDisabled = isPending || !session;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              MovieMatch
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Start a Watch Party 🎬
          </h1>
          <p className="text-muted">Let's get started with your movie night</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="partyName"
                className="text-card-foreground font-medium"
              >
                Name Your Watch Party
              </Label>
              <Input
                id="partyName"
                placeholder="e.g., Friday Night Movies 🍿"
                {...form.register("partyName")}
                className="h-12 bg-background/50 border-border"
              />
              {form.formState.errors.partyName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.partyName.message}
                </p>
              )}
              <p className="text-xs text-muted">Make it memorable!</p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="userName"
                className="text-card-foreground font-medium"
              >
                What's Your Name?
              </Label>
              <Input
                id="userName"
                placeholder="Your name ✨"
                {...form.register("userName")}
                className="h-12 bg-background/50 border-border"
              />
              {form.formState.errors.userName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.userName.message}
                </p>
              )}
              <p className="text-xs text-muted">
                So your friends know who's hosting
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full h-12">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isButtonDisabled}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Create Party"
                )}
              </Button>
            </div>
            {!session && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                Connecting to server...
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
