const launchDate = new Date("2026-10-01T12:00:00+03:00").getTime();

const elements = {
    days: document.querySelector("#days"),
    hours: document.querySelector("#hours"),
    minutes: document.querySelector("#minutes"),
    seconds: document.querySelector("#seconds"),
    year: document.querySelector("#current-year"),
    form: document.querySelector("#notify-form"),
    email: document.querySelector("#email"),
    message: document.querySelector("#form-message")
};

function pad(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    const distance = Math.max(launchDate - Date.now(), 0);
    const days = Math.floor(distance / 86_400_000);
    const hours = Math.floor((distance / 3_600_000) % 24);
    const minutes = Math.floor((distance / 60_000) % 60);
    const seconds = Math.floor((distance / 1_000) % 60);

    elements.days.textContent = pad(days);
    elements.hours.textContent = pad(hours);
    elements.minutes.textContent = pad(minutes);
    elements.seconds.textContent = pad(seconds);
}

function handleSubscription(event) {
    event.preventDefault();

    if (!elements.email.validity.valid) {
        elements.message.textContent = "Please enter a valid email address.";
        elements.message.classList.add("is-error");
        elements.email.focus();
        return;
    }

    elements.message.textContent = "You're on the list. We'll keep you posted.";
    elements.message.classList.remove("is-error");
    elements.message.classList.add("is-success");
    elements.form.reset();
}

elements.year.textContent = new Date().getFullYear();
elements.form.addEventListener("submit", handleSubscription);
updateCountdown();
window.setInterval(updateCountdown, 1_000);
