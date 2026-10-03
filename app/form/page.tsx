"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

interface RadioOptionProps {
  label: string;
  name: string;
  value: string;
  selected: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Home() {
  const initialForm = {
    fullName: "",
    username: "",
    email: "",
    contact: "",
    occupation: "",
    zipCode: "",
    city: "",
    country: "",
    dob: "",
    maritalStatus: "",
    nationality: "",
    identificationType: "",
    idNumber: "",
    primaryKey: "",
    gender: "",
    age: "",
    subsidyBenefit: "",
    welfareBenefit: "",
    eligibility: "",
    healthMedicare: "",
    paymentMode: "",
    query: "",
    declaration: "",
    approval: "",
    denomination: "",
    selectedName: "",
    authStatus: "",
    authTime: "",
    sessionDuration: "00:00:00",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  // Stopwatch states (Auto-start enabled by default)
  const [time, setTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to play ONLY ONE rotational wav file at a time
  const playNextRotationalWav = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audioFiles = ["/playe1.wav", "/playe2.wav", "/playe3.wav"];
    
    // Get the last played index from localStorage, default to 0
    const storedIndex = localStorage.getItem("zipher_audio_index");
    let nextIndex = storedIndex ? (parseInt(storedIndex, 10) + 1) % audioFiles.length : 0;

    // Save the new index for the next user visit / action
    localStorage.setItem("zipher_audio_index", nextIndex.toString());

    // Play only that single file
    const audio = new Audio(audioFiles[nextIndex]);
    currentAudioRef.current = audio;

    audio.play().catch((err) => {
      console.log("Audio playback error (browser restriction):", err);
    });
  };

  // Helper function to save timer to Supabase Auth metadata
  const saveTimerToAuth = async (currentMs: number) => {
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        timer_ms: currentMs,
        timer_updated_at: new Date().toISOString(),
      },
    });
  };

  // Fetch saved timer from Supabase Auth metadata and check 24-hour reset rule, plus auto-play once per entry/session
  useEffect(() => {
    const initPageSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const metadata = user.user_metadata || {};
      const savedMs = metadata.timer_ms || 0;
      const lastActive = metadata.timer_updated_at ? new Date(metadata.timer_updated_at).getTime() : 0;
      
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (lastActive && (now - lastActive > oneDayMs)) {
        setTime(0);
        await supabase.auth.updateUser({
          data: { 
            timer_ms: 0, 
            timer_updated_at: new Date().toISOString() 
          }
        });
      } else {
        setTime(savedMs);
      }

      // Check if audio already played for this fresh load / session to avoid re-triggering on browser refresh
      const hasPlayedThisSession = sessionStorage.getItem("zipher_session_audio_played");
      if (!hasPlayedThisSession) {
        sessionStorage.setItem("zipher_session_audio_played", "true");
        playNextRotationalWav();
      }
    };

    initPageSession();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      timerRef.current = setInterval(() => {
        const currentTimeMs = Date.now() - startTime;
        setTime(currentTimeMs);
        // Periodic sync to Supabase auth metadata to persist through hard refreshes
        saveTimerToAuth(currentTimeMs);
      }, 1000); // Sync every second to prevent data loss on refresh
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Format time as HH:MM:SS (Hours, Minutes, Seconds only)
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  const handleStartPause = async () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      playNextRotationalWav(); 
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      await saveTimerToAuth(time);
    }
  };

  const handleResetTimer = async () => {
    setIsRunning(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setTime(0);
    setForm((prev) => ({ ...prev, sessionDuration: "00:00:00" }));
    await saveTimerToAuth(0);
  };

  // Theme state with localStorage initialization
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("zipher_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const router = useRouter();

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("zipher_logged_in");

    if (!loggedIn) {
      const supabase = createClient();

      supabase.auth.signOut().finally(() => {
        router.replace("/login");
      });
    }
  }, [router]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zipher_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = async () => {
    setForm(initialForm);
    setResult("");
    setIsRunning(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setTime(0);
    await saveTimerToAuth(0);
    setIsRunning(true);
    playNextRotationalWav();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const finalPayload = {
      ...form,
      sessionDuration: formatTime(time),
    };

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form submitted successfully!");
        setForm(initialForm);
        setIsRunning(false);
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        setTime(0);
        await saveTimerToAuth(0);
        setIsRunning(true);
        playNextRotationalWav();
      } else {
        setResult(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const namesList = [
    "Jennifer", "Veronica", "Chris", "Peter", "John", "Bella", 
    "Stefart", "Shepherd", "Diana", "Emma", "Cathirana", "Jimmy"
  ];

  const denominationList = [
    "Catholic", "Protestant", "Orthodox", "Other Christian", 
    "Islam", "Hinduism", "No Religion", "Other", "Prefer not to say"
  ];

  return (
    <main
      className="min-h-screen text-white flex items-center justify-center p-4 md:p-6 font-sans transition-colors duration-300"
      style={{ backgroundColor: "var(--theme-bg)" }}
    >
      <div className="max-w-2xl w-full mx-auto">

        {/* Form Card */}
        <div
          className="backdrop-blur-xl rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
            borderWidth: "1px",
            boxShadow: "0 0 50px var(--theme-glow)"
          }}
        >

          {/* Decorative Cyber Glow Lines */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(to right, transparent, var(--theme-primary), transparent)` }}
          />

          {/* Theme Toggle Button Top Right */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all"
              style={{
                backgroundColor: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-main)",
              }}
            >
              {theme === "dark" ? (
                <>
                  <span>☀️</span> Light Mode
                </>
              ) : (
                <>
                  <span>🌙</span> Dark Mode
                </>
              )}
            </button>
          </div>

          {/* Compact Timer Widget aligned to the left above the logo */}
          <div 
            className="mb-6 p-2.5 rounded-xl border inline-flex flex-col items-start gap-2 shadow-sm transition-all"
            style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
          >
            <div className="flex items-center gap-2 px-1">
              {/* Stopwatch Icon */}
              <svg className="w-4 h-4" style={{ color: "var(--theme-primary)" }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="font-mono text-sm font-bold tracking-wider" style={{ color: "var(--theme-text-main)" }}>
                {formatTime(time)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartPause}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer ${
                  isRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer hover:opacity-80"
                style={{ backgroundColor: "var(--theme-card-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Header */}
          <div
            className="flex items-center gap-5 mb-8 pb-6 border-b"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 blur-xl opacity-30 rounded-full"
                style={{ backgroundColor: "var(--theme-primary)" }}
              />
              <img
                src="/z-logo.png"
                alt="Zipher Logo"
                className="w-20 h-20 md:w-28 md:h-28 object-contain relative z-10"
              />
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, var(--theme-text-main), var(--theme-primary))` }}
              >
                Zipher Data Policy
              </h1>
              <p className="text-xs md:text-sm mt-1 font-medium tracking-wide" style={{ color: "var(--theme-text-muted)" }}>
                Your Data <span className="font-bold mx-1" style={{ color: "var(--theme-primary)" }}>|</span> Our Responsibility
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Information */}
            <section>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-1.5 border-b flex items-center gap-2"
                style={{ color: "var(--theme-primary)", borderColor: "var(--theme-border)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} required />
                <Input label="Username" name="username" placeholder="Enter your username" value={form.username} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                <Input label="Contact Number" name="contact" type="tel" placeholder="Enter your contact number" value={form.contact} onChange={handleChange} />
                <Input label="Age" name="age" type="number" placeholder="Enter your age" value={form.age} onChange={handleChange} />
                <Input label="Occupation" name="occupation" placeholder="Enter your occupation" value={form.occupation} onChange={handleChange} />
                <Input label="Date of Birth" name="dob" type="date" placeholder="Select your DOB" value={form.dob} onChange={handleChange} />
                <Input label="Marital Status" name="maritalStatus" placeholder="Enter your marital status" value={form.maritalStatus} onChange={handleChange} />
                <div className="md:col-span-2">
                  <Input label="Nationality" name="nationality" placeholder="Enter your nationality" value={form.nationality} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-1.5 border-b flex items-center gap-2"
                style={{ color: "var(--theme-primary)", borderColor: "var(--theme-border)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Location Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Zip Code" name="zipCode" placeholder="Enter zip code" value={form.zipCode} onChange={handleChange} />
                <Input label="City" name="city" placeholder="Enter city name" value={form.city} onChange={handleChange} />
                <div className="md:col-span-2">
                  <Input label="Country" name="country" placeholder="Enter country name" value={form.country} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Identification Type */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Identification Type
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Select your identification type
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <RadioOption label="SSN" name="identificationType" value="SSN" selected={form.identificationType} onChange={handleChange} />
                <RadioOption label="NINo" name="identificationType" value="NINo" selected={form.identificationType} onChange={handleChange} />
                <RadioOption label="SIN" name="identificationType" value="SIN" selected={form.identificationType} onChange={handleChange} />
              </div>
            </section>

            {/* Identification Number */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Identification Number
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="" name="idNumber" placeholder="Enter I.D Number" value={form.idNumber} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Primary Key */}
            <section>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2"
                style={{ color: "var(--theme-primary)", borderColor: "var(--theme-border)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Primary Key
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="" name="primaryKey" placeholder="Enter primary key" value={form.primaryKey} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Gender */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Gender
              </h2>
              <div className="grid md:grid-cols-3 gap-3">
                <RadioOption label="Male" name="gender" value="Male" selected={form.gender} onChange={handleChange} />
                <RadioOption label="Female" name="gender" value="Female" selected={form.gender} onChange={handleChange} />
                <RadioOption label="Prefer not to say" name="gender" value="Prefer not to say" selected={form.gender} onChange={handleChange} />
              </div>
            </section>

            {/* Subsidy Benefits */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Subsidy Benefits
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                <RadioOption label="SSDI" name="subsidyBenefit" value="SSDI" selected={form.subsidyBenefit} onChange={handleChange} />
                <RadioOption label="SSI" name="subsidyBenefit" value="SSI" selected={form.subsidyBenefit} onChange={handleChange} />
              </div>
            </section>

            {/* Welfare Benefits */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Welfare Benefits
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <RadioOption label="PIP" name="welfareBenefit" value="PIP" selected={form.welfareBenefit} onChange={handleChange} />
                <RadioOption label="ESA" name="welfareBenefit" value="ESA" selected={form.welfareBenefit} onChange={handleChange} />
                <RadioOption label="CPP-D" name="welfareBenefit" value="CPP-D" selected={form.welfareBenefit} onChange={handleChange} />
                <RadioOption label="CDB" name="welfareBenefit" value="CDB" selected={form.welfareBenefit} onChange={handleChange} />
                <RadioOption label="DTC" name="welfareBenefit" value="DTC" selected={form.welfareBenefit} onChange={handleChange} />
              </div>
            </section>

            {/* Health Medicare */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Health Medicare
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Select your coverage type
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <RadioOption label="Premium" name="healthMedicare" value="Premium" selected={form.healthMedicare} onChange={handleChange} />
                <RadioOption label="Standard" name="healthMedicare" value="Standard" selected={form.healthMedicare} onChange={handleChange} />
                <RadioOption label="Basic" name="healthMedicare" value="Basic" selected={form.healthMedicare} onChange={handleChange} />
              </div>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Eligibility
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Please confirm if you meet the age requirement to proceed with your data policy submission.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <RadioOption label="Yes" name="eligibility" value="Yes" selected={form.eligibility} onChange={handleChange} />
                <RadioOption label="No" name="eligibility" value="No" selected={form.eligibility} onChange={handleChange} />
              </div>
            </section>

            {/* Payment Mode */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Payment Mode
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Select your preferred currency option
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <RadioOption label="USD $" name="paymentMode" value="USD $" selected={form.paymentMode} onChange={handleChange} />
                <RadioOption label="GBP £" name="paymentMode" value="GBP £" selected={form.paymentMode} onChange={handleChange} />
                <RadioOption label="CAD $" name="paymentMode" value="CAD $" selected={form.paymentMode} onChange={handleChange} />
              </div>
            </section>

            {/* Query Box */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Query
              </h2>
              <textarea
                name="query"
                value={form.query}
                onChange={handleChange}
                placeholder="Write your query here..."
                rows={4}
                className="w-full rounded-sm border p-3.5 text-sm placeholder-slate-400 outline-none transition-all"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              />
            </section>

            {/* Declaration Form Box */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Declaration
              </h2>
              <textarea
                name="declaration"
                value={form.declaration}
                onChange={handleChange}
                placeholder="Write your declaration here..."
                rows={4}
                className="w-full rounded-sm border p-3.5 text-sm placeholder-slate-400 outline-none transition-all"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              />
            </section>

            {/* Approval Box */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Approval
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Please provide your approval status
              </p>
              <div className="grid grid-cols-2 gap-3">
                <RadioOption label="Yes" name="approval" value="Yes" selected={form.approval} onChange={handleChange} />
                <RadioOption label="No" name="approval" value="No" selected={form.approval} onChange={handleChange} />
              </div>
            </section>

            {/* Denomination */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Denomination
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Select your denomination option
              </p>
              <select
                name="denomination"
                value={form.denomination}
                onChange={handleChange}
                className="w-full rounded-sm border p-3.5 text-sm outline-none transition-all cursor-pointer"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              >
                <option value="" disabled>Select denomination...</option>
                {denominationList.map((item) => (
                  <option key={item} value={item} style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text-main)" }}>
                    {item}
                  </option>
                ))}
              </select>
            </section>

            {/* Selected */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Selected
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Choose a name from the list
              </p>
              <select
                name="selectedName"
                value={form.selectedName}
                onChange={handleChange}
                className="w-full rounded-sm border p-3.5 text-sm outline-none transition-all cursor-pointer"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              >
                <option value="" disabled>Select a name...</option>
                {namesList.map((name) => (
                  <option key={name} value={name} style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text-main)" }}>
                    {name}
                  </option>
                ))}
              </select>
            </section>

            {/* Authentication System */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} /> Authentication System
              </h2>
              <div className="space-y-4">
                <select
                  name="authStatus"
                  value={form.authStatus}
                  onChange={handleChange}
                  className="w-full rounded-sm border p-3.5 text-sm outline-none transition-all cursor-pointer mb-3"
                  style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
                >
                  <option value="">Select status</option>
                  <option value="Login" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text-main)" }}>Login</option>
                  <option value="Logout" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text-main)" }}>Logout</option>
                </select>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} />Authentication Time
              </h2>
              <div>
                <div className="relative">
                  <input
                    type="time"
                    name="authTime"
                    value={form.authTime}
                    onChange={handleChange}
                    placeholder="Select or type time"
                    className="w-full rounded-sm border p-3.5 text-sm placeholder-slate-400 outline-none transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.5]"
                    style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
                  />
                </div>
              </div>
            </section>

            {/* Full-width Data Tracker */}
            <section
              className="flex items-center justify-between p-3 rounded-sm border w-full"
              style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
            >
              <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--theme-text-muted)" }}>Data tracker</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                </span>
                <span className="text-xs font-semibold text-red-400 tracking-wider">LIVE</span>
              </div>
            </section>

            {/* Small Refresh Button on Left Side in New Row */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2.5 px-5 rounded-sm border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 hover:opacity-95"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
              >
                <span>🔄</span> Refresh
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-sm text-sm font-medium border ${result.includes("successfully") ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : "bg-rose-950/40 border-rose-500/30 text-rose-300"}`}>
                {result}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-1/2 py-3.5 cursor-pointer rounded-sm border font-semibold text-sm transition-all"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-muted)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3.5 cursor-pointer rounded-sm font-semibold text-sm transition-all text-white hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: "var(--theme-primary)", boxShadow: "0 0 20px var(--theme-glow)" }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>

            {/* TRUSTED PARTNERS & SERVICES INTEGRATION */}
            <div className="pt-6 border-t" style={{ borderColor: "var(--theme-border)" }}>
              <h3 className="text-[11px] font-bold tracking-widest mb-4 text-center uppercase" style={{ color: "var(--theme-text-muted)" }}>
                Trusted Partners & Services
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <img src="/logo1.png" alt="Logo 1" className="h-20 md:h-22 object-contain hover:opacity-100 transition-opacity duration-300 filter drop-shadow" />
                <img src="/logo2.png" alt="Logo 2" className="h-20 md:h-22 object-contain hover:opacity-100 transition-opacity duration-300 filter drop-shadow" />
                <img src="/logo3.png" alt="Logo 3" className="h-20 md:h-22 object-contain hover:opacity-100 transition-opacity duration-300 filter drop-shadow" />
                <img src="/logo4.png" alt="Logo 4" className="h-20 md:h-22 object-contain hover:opacity-100 transition-opacity duration-300 filter drop-shadow" />
              </div>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder = "", required = false }: InputProps) {
  return (
    <div>
      {label && <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-text-muted)" }}>{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-sm border p-3.5 text-sm placeholder-slate-400 outline-none transition-all"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)", color: "var(--theme-text-main)" }}
      />
    </div>
  );
}

function RadioOption({ label, name, value, selected, onChange }: RadioOptionProps) {
  const isSelected = selected === value;
  return (
    <label
      className={`flex items-center gap-3 p-3.5 rounded-sm border cursor-pointer text-sm transition-all`}
      style={{
        borderColor: isSelected ? "var(--theme-primary)" : "var(--theme-border)",
        backgroundColor: isSelected ? "var(--theme-glow)" : "var(--theme-bg)",
        color: isSelected ? "var(--theme-text-main)" : "var(--theme-text-muted)"
      }}
    >
      <input type="radio" name={name} value={value} checked={isSelected} onChange={onChange} style={{ accentColor: "var(--theme-primary)" }} />
      <span className="font-medium">{label}</span>
    </label>
  );
}