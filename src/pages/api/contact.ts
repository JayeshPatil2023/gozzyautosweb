import type { APIRoute } from "astro";
import {
	json,
	readBody,
	str,
	formatReplyToAddress,
	formatContactEmailText,
	formatContactEmailHtml,
	sendEmail,
	withErrors,
} from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	return withErrors(async () => {
		const body = await readBody<Record<string, unknown>>(request);

		const firstName = str(body.firstName);
		const lastName = str(body.lastName);
		const email = str(body.email);
		const phone = str(body.phone);
		const comments = str(body.comments);

		// Validation checks
		if (!firstName) {
			return json({ success: false, message: "Please provide your first name." }, 400);
		}
		if (!lastName) {
			return json({ success: false, message: "Please provide your last name." }, 400);
		}
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ success: false, message: "Please enter a valid email address." }, 400);
		}
		if (!phone) {
			return json({ success: false, message: "Please provide your phone number." }, 400);
		}
		if (!comments) {
			return json({ success: false, message: "Please enter your message or comments." }, 400);
		}

		const formData = { firstName, lastName, email, phone, comments };
		const fullName = `${firstName} ${lastName}`;
		const replyTo = formatReplyToAddress(fullName, email);

		// Send email notification to site admin
		await sendEmail({
			subject: `New Contact Inquiry from ${fullName} — Gozzy Autos`,
			fromDisplayName: `${fullName} (Contact Form)`,
			replyTo,
			text: formatContactEmailText(formData),
			html: formatContactEmailHtml(formData),
		});

		return json({
			success: true,
			message: "Thank you! Your message has been sent successfully. Our team will contact you shortly.",
		});
	});
};
