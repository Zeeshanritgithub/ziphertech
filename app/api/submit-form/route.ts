import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      username,
      email,
      contact,
      zipCode,
      city,
      country,
      gender,
      age,
      subsidyBenefit,
      eligibility,
      healthMedicare,
      paymentMode,
      query,
      declaration,
      approval,
      selectedName,
    } = body;

    // Basic Validation
    if (!fullName || !username || !email || !gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, username, email and gender are required.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    // Supabase Server Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save Data in Supabase
    const { data, error } = await supabase
      .from("form_submissions")
      .insert([
        {
          full_name: fullName,
          username: username,
          email: email,
          contact: contact || null,
          zip_code: zipCode,
          city: city,
          country: country,
          gender: gender,
          age: age ? Number(age) : null,
          subsidy_benefit: subsidyBenefit,
          eligibility: eligibility,
          health_medicare: healthMedicare,
          payment_mode: paymentMode || null,
          query: query,
          declaration: declaration || null,
          approval: approval || null,
          selected_name: selectedName || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error Details:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Supabase Error: ${error.message} (Code: ${error.code})`,
        },
        { status: 500 }
      );
    }

    // Resend Email
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!resendApiKey || !adminEmail) {
      throw new Error("Missing Resend environment variables.");
    }

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: "Zipher Form <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Zipher Form Submission - ${fullName}`,
      html: `
        <h2>New Zipher Data Policy Submission</h2>
        <hr />
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact Number:</strong> ${contact || "-"}</p>
        <hr />
        <p><strong>Zip Code:</strong> ${zipCode || "-"}</p>
        <p><strong>City:</strong> ${city || "-"}</p>
        <p><strong>Country:</strong> ${country || "-"}</p>
        <hr />
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Age:</strong> ${age || "-"}</p>
        <hr />
        <p><strong>Subsidy Benefit:</strong> ${subsidyBenefit || "-"}</p>
        <p><strong>Eligibility:</strong> ${eligibility || "-"}</p>
        <p><strong>Health Medicare:</strong> ${healthMedicare || "-"}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode || "-"}</p>
        <p><strong>Approval:</strong> ${approval || "-"}</p>
        <p><strong>Selected Name:</strong> ${selectedName || "-"}</p>
        <hr />
        <h3>User Query</h3>
        <p>${query || "-"}</p>
        <hr />
        <h3>Declaration</h3>
        <p>${declaration || "-"}</p>
      `,
    });

    if (emailError) {
      console.error("Resend Email Error Details:", emailError);
      return NextResponse.json(
        {
          success: false,
          message: `Email Error: ${emailError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully!",
      data,
    });

  } catch (error: unknown) {
    console.error("Server Catch Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}