"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, Loader2 } from "lucide-react";
import { COMPANY_SIZES } from "@/lib/demo-request";

type FormData = {
  workEmail: string;
  companySize: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  country: string;
  phone: string;
  marketingConsent: boolean;
};

const initialData: FormData = {
  workEmail: "",
  companySize: "",
  firstName: "",
  lastName: "",
  companyName: "",
  jobTitle: "",
  country: "",
  phone: "",
  marketingConsent: false,
};

const totalSteps = 9;
export function DemoForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [website, setWebsite] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fieldRef.current?.focus();
  }, [step]);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const validate = () => {
    if (step === 0 && !/^\S+@\S+\.\S+$/.test(data.workEmail)) return "Enter a valid work email address.";
    if (step === 1 && !data.companySize) return "Select your company size.";
    if (step === 2 && !data.firstName.trim()) return "Enter your first name.";
    if (step === 3 && !data.lastName.trim()) return "Enter your last name.";
    if (step === 4 && !data.companyName.trim()) return "Enter your company name.";
    if (step === 5 && !data.jobTitle.trim()) return "Enter your job title.";
    if (step === 6 && !data.country.trim()) return "Enter your country or region.";
    if (step === 7 && !data.phone.trim()) return "Enter your phone number.";
    return "";
  };

  const next = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    if (step === totalSteps - 1) {
      setIsSubmitting(true);
      setError("");
      try {
        const response = await fetch("/api/demo-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, website, formStartedAt }),
        });
        const result = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(result.error || "We could not save your request. Please try again.");
        setComplete(true);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "We could not save your request. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setStep((current) => current + 1);
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSubmitting) await next();
  };

  if (complete) {
    return (
      <section className="flex min-h-screen items-center bg-white px-5 py-32 sm:px-8">
        <div className="mx-auto w-full max-w-2xl animate-slideUp text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-8" /></div>
          <p className="mt-8 text-sm font-bold text-violet-700">Request received</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Thanks, {data.firstName}.</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-600">Our team will review your details and contact you at <strong className="text-slate-900">{data.workEmail}</strong> to arrange your Watchtower demo.</p>
          <Link href="/resources" className="mt-9 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-800">Explore resources <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <div className="pointer-events-none absolute -right-48 top-1/4 size-[34rem] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={back} disabled={step === 0 || isSubmitting} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950 disabled:invisible"><ChevronLeft className="size-4" /> Back</button>
          <p className="text-sm font-semibold text-slate-500">{step + 1} of {totalSteps}</p>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label={`Step ${step + 1} of ${totalSteps}`}>
          <div className="h-full rounded-full bg-violet-600 transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>

        <form onSubmit={submit} className="relative mx-auto mt-20 max-w-2xl sm:mt-28" noValidate>
          <div key={step} className="animate-slideUp">
            {step === 0 && <TextStep eyebrow="Let’s get started" title="What’s your work email?" type="email" value={data.workEmail} onChange={(value) => setField("workEmail", value)} placeholder="you@company.com" autoComplete="email" inputRef={fieldRef} />}
            {step === 1 && (
              <fieldset>
                <legend className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl">How many people work at your company?</legend>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {COMPANY_SIZES.map((size) => (
                    <button key={size} type="button" onClick={() => setField("companySize", size)} className={`flex items-center justify-between rounded-2xl border p-5 text-left text-lg font-bold transition ${data.companySize === size ? "border-violet-600 bg-violet-50 text-violet-800 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-violet-300"}`}>
                      <span>{size} people</span>{data.companySize === size && <Check className="size-5" />}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {step === 2 && <TextStep eyebrow="Just a few more details" title="What’s your first name?" value={data.firstName} onChange={(value) => setField("firstName", value)} placeholder="Ada" autoComplete="given-name" inputRef={fieldRef} />}
            {step === 3 && <TextStep eyebrow="Nice to meet you" title="What’s your last name?" value={data.lastName} onChange={(value) => setField("lastName", value)} placeholder="Okafor" autoComplete="family-name" inputRef={fieldRef} />}
            {step === 4 && <TextStep eyebrow="About your team" title="What’s your company name?" value={data.companyName} onChange={(value) => setField("companyName", value)} placeholder="Acme Ltd" autoComplete="organization" inputRef={fieldRef} />}
            {step === 5 && <TextStep eyebrow="Your role" title="What’s your job title?" value={data.jobTitle} onChange={(value) => setField("jobTitle", value)} placeholder="Head of Operations" autoComplete="organization-title" inputRef={fieldRef} />}
            {step === 6 && <TextStep eyebrow="Where you work" title="What’s your country or region?" value={data.country} onChange={(value) => setField("country", value)} placeholder="Nigeria" autoComplete="country-name" inputRef={fieldRef} />}
            {step === 7 && <TextStep eyebrow="How we can reach you" title="What’s your phone number?" type="tel" value={data.phone} onChange={(value) => setField("phone", value)} placeholder="+234 800 000 0000" autoComplete="tel" inputRef={fieldRef} />}
            {step === 8 && (
              <fieldset>
                <legend className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl">Would you like Watchtower updates?</legend>
                <p className="mt-5 text-lg leading-8 text-slate-600">You can change this choice at any time.</p>
                <label className="mt-10 flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-300">
                  <input type="checkbox" checked={data.marketingConsent} onChange={(event) => setField("marketingConsent", event.target.checked)} className="mt-1 size-5 accent-violet-700" />
                  <span className="text-base leading-7 text-slate-700">I agree to receive marketing communications about Watchtower.</span>
                </label>
              </fieldset>
            )}
          </div>

          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="demo-website">Website</label>
            <input id="demo-website" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="mt-5 min-h-5" aria-live="polite">
            {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <button type="submit" disabled={isSubmitting} className="inline-flex h-13 items-center gap-2 rounded-full bg-violet-700 px-7 font-bold text-white shadow-xl shadow-violet-200 transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Sending request…</> : <>{step === totalSteps - 1 ? "Request my demo" : "Continue"} <ArrowRight className="size-4" /></>}
            </button>
            {step !== 1 && <span className="hidden text-xs text-slate-400 sm:inline">Press Enter ↵</span>}
          </div>
        </form>
      </div>
    </section>
  );
}

function TextStep({ eyebrow, title, value, onChange, placeholder, type = "text", autoComplete, inputRef }: { eyebrow: string; title: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; inputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div>
      <p className="mb-4 text-sm font-bold text-violet-700">{eyebrow}</p>
      <label className="block text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl">
        {title}
        <input ref={inputRef} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} className="mt-10 block w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 pb-4 text-2xl font-medium tracking-normal text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-violet-600 sm:text-3xl" />
      </label>
    </div>
  );
}
