const apiUrl = "/api/products";

const elements = {
    formCard: document.querySelector("#product-form-card"),
    form: document.querySelector("#product-form"),
    formTitle: document.querySelector("#form-title"),
    id: document.querySelector("#product-id"),
    name: document.querySelector("#product-name"),
    price: document.querySelector("#product-price"),
    nameError: document.querySelector("#name-error"),
    priceError: document.querySelector("#price-error"),
    saveButton: document.querySelector("#save-button"),
    openCreateButton: document.querySelector("#open-create-button"),
    closeFormButton: document.querySelector("#close-form-button"),
    cancelButton: document.querySelector("#cancel-button"),
    searchInput: document.querySelector("#search-input"),
    productsCount: document.querySelector("#products-count"),
    totalValue: document.querySelector("#total-value"),
    databaseStatus: document.querySelector("#database-status"),
    apiStatusText: document.querySelector("#api-status-text"),
    statusDot: document.querySelector("#status-dot"),
    loadingState: document.querySelector("#loading-state"),
    errorState: document.querySelector("#error-state"),
    emptyState: document.querySelector("#empty-state"),
    tableWrapper: document.querySelector("#table-wrapper"),
    productsBody: document.querySelector("#products-body"),
    rowTemplate: document.querySelector("#product-row-template"),
    toast: document.querySelector("#toast")
};

const logoutButton = document.querySelector("#logout-button");

let products = [];
const money = new Intl.NumberFormat("ar", { style: "currency", currency: "USD" });

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.title ?? `فشل الطلب (${response.status})`);
    }

    return response.status === 204 ? null : response.json();
}

async function loadProducts() {
    showLoading();

    try {
        products = await apiRequest(apiUrl);
        setConnection(true);
        updateStatistics();
        renderProducts();
    } catch (error) {
        setConnection(false);
        showError(error.message);
    }
}

function renderProducts() {
    const query = elements.searchInput.value.trim().toLocaleLowerCase();
    const visibleProducts = products.filter(product => product.name.toLocaleLowerCase().includes(query));

    elements.loadingState.classList.add("is-hidden");
    elements.errorState.classList.add("is-hidden");
    elements.productsBody.replaceChildren();
    elements.emptyState.classList.toggle("is-hidden", visibleProducts.length > 0);
    elements.tableWrapper.classList.toggle("is-hidden", visibleProducts.length === 0);

    for (const product of visibleProducts) {
        const row = elements.rowTemplate.content.cloneNode(true);
        row.querySelector(".product-id").textContent = `#${product.id}`;
        row.querySelector(".product-name").textContent = product.name;
        row.querySelector(".product-avatar").textContent = product.name.trim().charAt(0).toUpperCase();
        row.querySelector(".product-price").textContent = money.format(product.price);
        row.querySelector(".edit").addEventListener("click", () => openEditForm(product));
        row.querySelector(".delete").addEventListener("click", () => deleteProduct(product));
        elements.productsBody.append(row);
    }
}

function updateStatistics() {
    const total = products.reduce((sum, product) => sum + Number(product.price), 0);
    elements.productsCount.textContent = products.length;
    elements.totalValue.textContent = money.format(total);
}

function openCreateForm() {
    resetForm();
    elements.formCard.classList.remove("is-hidden");
    elements.name.focus();
}

function openEditForm(product) {
    elements.id.value = product.id;
    elements.name.value = product.name;
    elements.price.value = product.price;
    elements.formTitle.textContent = "تعديل المنتج";
    elements.saveButton.textContent = "حفظ التعديلات";
    elements.formCard.classList.remove("is-hidden");
    elements.formCard.scrollIntoView({ behavior: "smooth", block: "center" });
    elements.name.focus();
}

function closeForm() {
    elements.formCard.classList.add("is-hidden");
    resetForm();
}

function resetForm() {
    elements.form.reset();
    elements.id.value = "";
    elements.formTitle.textContent = "إضافة منتج جديد";
    elements.saveButton.textContent = "حفظ المنتج";
    elements.nameError.textContent = "";
    elements.priceError.textContent = "";
}

function validateForm() {
    const name = elements.name.value.trim();
    const price = Number(elements.price.value);
    elements.nameError.textContent = name ? "" : "اسم المنتج مطلوب.";
    elements.priceError.textContent = Number.isFinite(price) && price > 0 ? "" : "أدخل سعرًا أكبر من صفر.";
    return Boolean(name) && Number.isFinite(price) && price > 0;
}

async function saveProduct(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const id = elements.id.value;
    const payload = { name: elements.name.value.trim(), price: Number(elements.price.value) };
    setSaving(true);

    try {
        await apiRequest(id ? `${apiUrl}/${id}` : apiUrl, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(payload)
        });
        showToast(id ? "تم تحديث المنتج بنجاح." : "تمت إضافة المنتج بنجاح.");
        closeForm();
        await loadProducts();
    } catch (error) {
        showToast(error.message, true);
    } finally {
        setSaving(false);
    }
}

async function deleteProduct(product) {
    if (!window.confirm(`هل أنت متأكد من حذف «${product.name}»؟`)) return;

    try {
        await apiRequest(`${apiUrl}/${product.id}`, { method: "DELETE" });
        showToast("تم حذف المنتج.");
        await loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
}

function setSaving(isSaving) {
    elements.saveButton.disabled = isSaving;
    if (isSaving) elements.saveButton.textContent = "جاري الحفظ...";
}

function setConnection(isConnected) {
    elements.statusDot.classList.toggle("online", isConnected);
    elements.apiStatusText.textContent = isConnected ? "متصل" : "غير متصل";
    elements.databaseStatus.textContent = isConnected ? "متصلة" : "غير متصلة";
    elements.databaseStatus.classList.toggle("success", isConnected);
}

function showLoading() {
    elements.loadingState.classList.remove("is-hidden");
    elements.errorState.classList.add("is-hidden");
    elements.emptyState.classList.add("is-hidden");
    elements.tableWrapper.classList.add("is-hidden");
}

function showError(message) {
    elements.loadingState.classList.add("is-hidden");
    elements.errorState.textContent = `تعذر تحميل المنتجات: ${message}`;
    elements.errorState.classList.remove("is-hidden");
}

let toastTimer;
function showToast(message, isError = false) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle("error", isError);
    elements.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 3200);
}

elements.form.addEventListener("submit", saveProduct);
elements.openCreateButton.addEventListener("click", openCreateForm);
elements.closeFormButton.addEventListener("click", closeForm);
elements.cancelButton.addEventListener("click", closeForm);
elements.searchInput.addEventListener("input", renderProducts);
logoutButton.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login/";
});

await loadProducts();
