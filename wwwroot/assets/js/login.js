const elements = {
    form: document.querySelector("#login-form"),
    username: document.querySelector("#username"),
    password: document.querySelector("#password"),
    loginButton: document.querySelector("#login-button"),
    error: document.querySelector("#login-error"),
    togglePassword: document.querySelector("#toggle-password")
};

const returnUrl = getSafeReturnUrl();

function getSafeReturnUrl() {
    const requestedUrl = new URLSearchParams(window.location.search).get("returnUrl");
    return requestedUrl?.startsWith("/") && !requestedUrl.startsWith("//")
        ? requestedUrl
        : "/admin/";
}

async function redirectAuthenticatedUser() {
    const response = await fetch("/api/auth/me");
    if (response.ok) window.location.replace(returnUrl);
}

async function login(event) {
    event.preventDefault();
    elements.error.textContent = "";

    if (!elements.username.value.trim() || !elements.password.value) {
        elements.error.textContent = "أدخل اسم المستخدم وكلمة المرور.";
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: elements.username.value.trim(),
                password: elements.password.value
            })
        });

        if (!response.ok) {
            const result = await response.json().catch(() => null);
            throw new Error(result?.message ?? "تعذر تسجيل الدخول.");
        }

        window.location.replace(returnUrl);
    } catch (error) {
        elements.error.textContent = error.message;
        setLoading(false);
    }
}

function setLoading(isLoading) {
    elements.loginButton.disabled = isLoading;
    elements.loginButton.textContent = isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول ←";
}

elements.togglePassword.addEventListener("click", () => {
    const shouldShow = elements.password.type === "password";
    elements.password.type = shouldShow ? "text" : "password";
    elements.togglePassword.textContent = shouldShow ? "إخفاء" : "إظهار";
});

elements.form.addEventListener("submit", login);
await redirectAuthenticatedUser();
