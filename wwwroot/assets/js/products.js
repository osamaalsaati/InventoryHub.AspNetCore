const apiUrl = "/api/products";

const elements = {
    form: document.querySelector("#product-form"),
    id: document.querySelector("#product-id"),
    name: document.querySelector("#product-name"),
    price: document.querySelector("#product-price"),
    nameError: document.querySelector("#name-error"),
    priceError: document.querySelector("#price-error"),
    formTitle: document.querySelector("#form-title"),
    formMessage: document.querySelector("#form-message"),
    submitButton: document.querySelector("#submit-button"),
    cancelEditButton: document.querySelector("#cancel-edit"),
    connectionStatus: document.querySelector("#connection-status"),
    statusCard: document.querySelector(".status-card"),
    count: document.querySelector("#products-count"),
    loading: document.querySelector("#loading-state"),
    empty: document.querySelector("#empty-state"),
    tableWrapper: document.querySelector("#products-table-wrapper"),
    tableBody: document.querySelector("#products-table-body"),
    rowTemplate: document.querySelector("#product-row-template")
};

let products = [];
const formatPrice = new Intl.NumberFormat("ar", { style: "currency", currency: "USD" });

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.title ?? "تعذر إكمال الطلب.");
    }

    return response.status === 204 ? null : response.json();
}

async function loadProducts() {
    setConnectionState("loading", "جاري الاتصال…");

    try {
        products = await request(apiUrl);
        renderProducts();
        setConnectionState("connected", "متصل بقاعدة البيانات");
    } catch (error) {
        elements.loading.textContent = "تعذر تحميل المنتجات. تأكد أن MariaDB تعمل.";
        setConnectionState("error", "تعذر الاتصال");
        console.error(error);
    }
}

function renderProducts() {
    elements.loading.classList.add("is-hidden");
    elements.tableBody.replaceChildren();
    elements.count.textContent = `${products.length} ${products.length === 1 ? "منتج" : "منتجات"}`;

    elements.empty.classList.toggle("is-hidden", products.length > 0);
    elements.tableWrapper.classList.toggle("is-hidden", products.length === 0);

    for (const product of products) {
        const row = elements.rowTemplate.content.cloneNode(true);
        row.querySelector(".product-name").textContent = product.name;
        row.querySelector(".product-price").textContent = formatPrice.format(product.price);
        row.querySelector(".edit-button").addEventListener("click", () => startEditing(product));
        row.querySelector(".delete-button").addEventListener("click", () => deleteProduct(product));
        elements.tableBody.append(row);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const id = elements.id.value;
    const payload = { name: elements.name.value.trim(), price: Number(elements.price.value) };
    setFormBusy(true);
    showFormMessage("");

    try {
        if (id) {
            await request(`${apiUrl}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            showFormMessage("تم تحديث المنتج بنجاح.");
        } else {
            await request(apiUrl, { method: "POST", body: JSON.stringify(payload) });
            showFormMessage("تمت إضافة المنتج بنجاح.");
        }

        resetForm();
        await loadProducts();
    } catch (error) {
        showFormMessage(error.message, true);
    } finally {
        setFormBusy(false);
    }
}

function startEditing(product) {
    elements.id.value = product.id;
    elements.name.value = product.name;
    elements.price.value = product.price;
    elements.formTitle.textContent = "تعديل المنتج";
    elements.submitButton.textContent = "حفظ التعديلات";
    elements.cancelEditButton.classList.remove("is-hidden");
    showFormMessage("");
    elements.name.focus();
}

async function deleteProduct(product) {
    if (!window.confirm(`هل تريد حذف «${product.name}»؟`)) return;

    try {
        await request(`${apiUrl}/${product.id}`, { method: "DELETE" });
        await loadProducts();
    } catch (error) {
        showFormMessage(error.message, true);
    }
}

function validateForm() {
    const name = elements.name.value.trim();
    const price = Number(elements.price.value);
    elements.nameError.textContent = name ? "" : "اكتب اسم المنتج.";
    elements.priceError.textContent = Number.isFinite(price) && price > 0 ? "" : "اكتب سعرًا أكبر من صفر.";
    return Boolean(name) && Number.isFinite(price) && price > 0;
}

function resetForm() {
    elements.form.reset();
    elements.id.value = "";
    elements.formTitle.textContent = "إضافة منتج جديد";
    elements.submitButton.textContent = "حفظ المنتج";
    elements.cancelEditButton.classList.add("is-hidden");
    elements.nameError.textContent = "";
    elements.priceError.textContent = "";
}

function setFormBusy(isBusy) {
    elements.submitButton.disabled = isBusy;
    if (isBusy) elements.submitButton.textContent = "جاري الحفظ…";
}

function showFormMessage(message, isError = false) {
    elements.formMessage.textContent = message;
    elements.formMessage.classList.toggle("is-error", isError);
}

function setConnectionState(state, message) {
    elements.connectionStatus.textContent = message;
    elements.statusCard.classList.toggle("is-connected", state === "connected");
    elements.statusCard.classList.toggle("is-error", state === "error");
}

elements.form.addEventListener("submit", saveProduct);
elements.cancelEditButton.addEventListener("click", resetForm);
await loadProducts();
