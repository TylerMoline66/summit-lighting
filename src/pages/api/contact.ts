import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Mark this endpoint as server-rendered (not static)
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const name = data.name as string;
    const email = data.email as string;
    const phone = data.phone as string;
    const address = data.address as string;
    const message = data.message as string;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create transporter using Gmail SMTP
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailPassword) {
      console.error("GMAIL_APP_PASSWORD environment variable is not set");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service configuration error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tmoline@devpipeline.com",
        pass: gmailPassword,
      },
    });

    // Email content
    const emailContent = {
      from: "tmoline@devpipeline.com",
      to: "jarrod.caufield@gmail.com",
      subject: `New Contact Form Submission - ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Address:</strong> ${address || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>This message was sent from the Summit Holiday Lighting contact form.</em></p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Address: ${address || "Not provided"}

Message:
${message}

---
This message was sent from the Summit Holiday Lighting contact form.
      `,
    };

    // Send email
    await transporter.sendMail(emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully!",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send email",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
