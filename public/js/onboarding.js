const onboardingForm = document.getElementById("onboardingForm");
const onboardingMessage = document.getElementById("onboardingMessage");

const showOnboardingMessage = (text, isError = false) => {
  onboardingMessage.className = `message ${isError ? "error" : "success"}`;
  onboardingMessage.textContent = text;
};

onboardingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(onboardingForm);
  const payload = {
    brandName: formData.get("brandName"),
    instagramHandle: formData.get("instagramHandle"),
    category: formData.get("category"),
    sampleProductLink: formData.get("sampleProductLink"),
    contactInfo: formData.get("contactInfo"),
  };

  try {
    await window.HATTAH_API.apiRequest("/sellers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    onboardingForm.reset();
    showOnboardingMessage("Application submitted. The HATTAH team will review and contact you.");
  } catch (error) {
    showOnboardingMessage(error.message, true);
  }
});
