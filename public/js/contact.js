document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("contact-form");
	const submitBtn = document.getElementById("contact-submit-btn");
	const btnText = document.getElementById("btn-text");
	const btnIcon = document.getElementById("btn-icon");
	const successAlert = document.getElementById("contact-success-alert");
	const successText = document.getElementById("contact-success-text");
	const errorAlert = document.getElementById("contact-error-alert");
	const errorText = document.getElementById("contact-error-text");

	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Reset alerts
		if (successAlert) successAlert.classList.add("is-hidden");
		if (errorAlert) errorAlert.classList.add("is-hidden");

		const firstName = document.getElementById("firstName") ? document.getElementById("firstName").value.trim() : "";
		const lastName = document.getElementById("lastName") ? document.getElementById("lastName").value.trim() : "";
		const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
		const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
		const comments = document.getElementById("comments") ? document.getElementById("comments").value.trim() : "";

		// Client validation
		if (!firstName || !lastName || !email || !phone || !comments) {
			if (errorText) errorText.textContent = "Please fill in all required fields.";
			if (errorAlert) errorAlert.classList.remove("is-hidden");
			return;
		}

		// Disable submit button & show loading state
		if (submitBtn) submitBtn.disabled = true;
		if (btnText) btnText.textContent = "Sending Message...";
		if (btnIcon) btnIcon.className = "ph-duotone ph-spinner spinner";

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					phone,
					comments,
				}),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				if (successText) successText.textContent = data.message || "Thank you! Your message has been sent successfully.";
				if (successAlert) successAlert.classList.remove("is-hidden");
				form.reset();
			} else {
				if (errorText) errorText.textContent = data.message || "Failed to send message. Please try again.";
				if (errorAlert) errorAlert.classList.remove("is-hidden");
			}
		} catch (err) {
			console.error("Submission error:", err);
			if (errorText) errorText.textContent = "Network error while sending message. Please try again later.";
			if (errorAlert) errorAlert.classList.remove("is-hidden");
		} finally {
			// Restore button state
			if (submitBtn) submitBtn.disabled = false;
			if (btnText) btnText.textContent = "Send Message";
			if (btnIcon) btnIcon.className = "ph-duotone ph-paper-plane-tilt";
		}
	});
});
