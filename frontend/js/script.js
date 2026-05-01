document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const usernameInput = document.getElementById("username");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.getElementById("loginForm");
    const charCounter = document.getElementById("charCounter");
    const successMessage = document.getElementById("successMessage");

    const reqLength = document.getElementById("req-length");
    const reqNumber = document.getElementById("req-number");
    const reqMax = document.getElementById("req-max");

    const toggleBtn = document.querySelector(".toggle-password");

    // Toggle password visibility
    window.togglePassword = function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.textContent = "ซ่อน";
        } else {
            passwordInput.type = "password";
            toggleBtn.textContent = "แสดง";
        }
    };

    // Validate password
    function validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasMaxLength = password.length <= 100;

        // Update requirement indicators
        updateRequirement(reqLength, hasMinLength);
        updateRequirement(reqNumber, hasNumber);
        updateRequirement(reqMax, hasMaxLength);

        // Update character counter
        const length = password.length;
        charCounter.textContent = `${length} / 100 ตัวอักษร`;

        charCounter.classList.remove("warning", "error");
        if (length > 100) {
            charCounter.classList.add("error");
        } else if (length >= 90) {
            charCounter.classList.add("warning");
        }

        return hasMinLength && hasNumber && hasMaxLength;
    }

    // Update requirement visual state
    function updateRequirement(element, isValid) {
        const icon = element.querySelector(".requirement-icon");

        element.classList.remove("valid", "invalid");

        if (isValid) {
            element.classList.add("valid");
            icon.textContent = "✓";
        } else if (passwordInput.value.length > 0) {
            element.classList.add("invalid");
            icon.textContent = "✕";
        } else {
            icon.textContent = "○";
        }
    }

    // Check form validity
    function checkFormValidity() {
        const isPasswordValid = validatePassword(passwordInput.value);
        const isUsernameValid = usernameInput.value.trim().length > 0;

        loginBtn.disabled = !(isPasswordValid && isUsernameValid);

        // Update input styles
        if (passwordInput.value.length > 0) {
            passwordInput.classList.remove("success", "error");
            passwordInput.classList.add(isPasswordValid ? "success" : "error");
        } else {
            passwordInput.classList.remove("success", "error");
        }
    }

    // Event listeners
    passwordInput.addEventListener("input", checkFormValidity);
    usernameInput.addEventListener("input", checkFormValidity);

    // Form submission
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const password = passwordInput.value;
        const username = usernameInput.value.trim();
        const rememberMe = document.getElementById("rememberMe").checked;

        // Final validation
        if (username.length === 0) {
            document.getElementById("usernameError").classList.add("show");
            usernameInput.classList.add("error");
            return;
        }

        if (!validatePassword(password)) {
            return;
        }

        // เปลี่ยนข้อความปุ่มระหว่างรอ
        loginBtn.textContent = "กำลังตรวจสอบ...";
        loginBtn.disabled = true;

        try {
            // ยิง API ไปที่ Backend บน Render
            const response = await fetch("https://cs365-minisprint-workshop.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, rememberMe }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                // ล็อกอินสำเร็จ
                successMessage.classList.add("show");
                successMessage.textContent = "✓ เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ " + (data.user || username);
                loginBtn.textContent = "สำเร็จ!";
                
                // Reset after 3 seconds
                setTimeout(function () {
                    successMessage.classList.remove("show");
                    loginBtn.textContent = "เข้าสู่ระบบ";
                    loginForm.reset();
                    checkFormValidity();
                    passwordInput.classList.remove("success", "error");

                    // Reset requirements
                    [reqLength, reqNumber, reqMax].forEach(function (req) {
                        req.classList.remove("valid", "invalid");
                        req.querySelector(".requirement-icon").textContent = "○";
                    });

                    charCounter.textContent = "0 / 100 ตัวอักษร";
                    charCounter.classList.remove("warning", "error");
                }, 3000);

            } else {
                // กรณีรหัสผิด
                alert(data.detail || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                loginBtn.textContent = "เข้าสู่ระบบ";
                loginBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
            loginBtn.textContent = "เข้าสู่ระบบ";
            loginBtn.disabled = false;
        }
    });

    // Remove error on username input
    usernameInput.addEventListener("input", function () {
        document.getElementById("usernameError").classList.remove("show");
        usernameInput.classList.remove("error");
    });
});
