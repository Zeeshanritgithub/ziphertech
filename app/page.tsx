"use client";

import React, { useState } from "react";

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
    zipCode: "",
    city: "",
    country: "",
    gender: "",
    age: "",
    subsidyBenefit: "",
    eligibility: "",
    healthMedicare: "",
    query: "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setForm(initialForm);
    setResult("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form submitted successfully!");
        setForm(initialForm);
      } else {
        setResult(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main 
      className="min-h-screen text-white flex items-center justify-center p-4 md:p-6 font-sans"
      style={{ backgroundColor: "var(--theme-bg)" }}
    >
      <div className="max-w-2xl w-full mx-auto">
        
        {/* Form Card */}
        <div 
          className="backdrop-blur-xl rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl"
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
                className="w-full rounded-sm border p-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
              />
            </section>

            {/* Data Tracker Status Indicator */}
            <section 
              className="flex items-center justify-between p-3 rounded-sm border"
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
      <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-text-muted)" }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-sm border p-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
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