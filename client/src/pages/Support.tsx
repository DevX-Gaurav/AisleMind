import { useState } from "react";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy } from "lucide-react";

export default function Support() {
  const { user, submitTicket } = useApp();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTicket(subject, message);
    setSubject(""); setMessage("");
  };

  return (
    <Shell>
      <div className="container py-12 max-w-xl">
        <div className="text-center mb-8">
          <LifeBuoy className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground mt-2">Tell us what's going on — our team responds within a day.</p>
        </div>
        {!user ? (
          <p className="text-center text-muted-foreground">Please sign in to submit a support ticket.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-xl border-2 border-border bg-card p-6">
            <div><Label>Subject</Label><Input required value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Message</Label><Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5" /></div>
            <Button type="submit" variant="hero" className="w-full">Submit ticket</Button>
          </form>
        )}
      </div>
    </Shell>
  );
}
