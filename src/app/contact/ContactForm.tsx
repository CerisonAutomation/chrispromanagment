/**
 * @fileoverview Contact form — Client Component with native form validation.
 */
'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      subject: fd.get('subject'),
      message: fd.get('message'),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center space-y-4 p-10 rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.04)]">
        <div className="text-4xl">✅</div>
        <h3 className="text-lg font-semibold text-[#e8e4dc]">Message sent!</h3>
        <p className="text-sm text-[rgba(232,228,220,0.55)]">
          Thanks for reaching out — we&apos;ll be in touch within 24 hours.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStatus('idle')}
          className="mt-2"
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-6 rounded-2xl border border-border/50 bg-[#111214]"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">Name</Label>
          <Input id="cf-name" name="name" placeholder="Jane Smith" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input
            id="cf-email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-subject">Subject</Label>
        <Input
          id="cf-subject"
          name="subject"
          placeholder="Booking enquiry / Property partnership / Other"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-message">Message</Label>
        <Textarea
          id="cf-message"
          name="message"
          rows={5}
          placeholder="Tell us about your dates, property, or question…"
          required
          className="resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-destructive" role="alert">
          Something went wrong — please try emailing us directly.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === 'sending'}
        size="lg"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
