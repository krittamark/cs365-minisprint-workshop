const { test, expect } = require("@playwright/test");
const path = require("path");

const fileUrl = `file://${path.resolve(__dirname, "../frontend/index.html")}`;

test.describe("Login Page Automated Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl);
  });

  test("TC-01: Page should render correctly with correct title", async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/Login Page/);
    await expect(page.locator("h1")).toHaveText("เข้าสู่ระบบ");
  });

  test("TC-02: Login button should be disabled by default", async ({
    page,
  }) => {
    const loginBtn = page.locator("#loginBtn");
    await expect(loginBtn).toBeDisabled();
  });

  test("TC-03: Password validation - show error for short password", async ({
    page,
  }) => {
    await page.fill("#username", "testuser");
    await page.fill("#password", "short1");

    const reqLength = page.locator("#req-length");
    await expect(reqLength).toHaveClass(/invalid/);
    await expect(page.locator("#loginBtn")).toBeDisabled();
  });

  test("TC-04: Password validation - show error for no numbers", async ({
    page,
  }) => {
    await page.fill("#password", "passwordonly");

    const reqNumber = page.locator("#req-number");
    await expect(reqNumber).toHaveClass(/invalid/);
  });

  test("TC-05: Successful validation enables login button", async ({
    page,
  }) => {
    await page.fill("#username", "markkung");
    await page.fill("#password", "ValidPass123");

    await expect(page.locator("#loginBtn")).toBeEnabled();
  });

  test("TC-06: Password visibility toggle works", async ({ page }) => {
    const passwordInput = page.locator("#password");
    const toggleBtn = page.locator(".toggle-password");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(toggleBtn).toHaveText("ซ่อน");
  });

  test("TC-07: Successful login shows success message", async ({ page }) => {
    await page.fill("#username", "admin");
    await page.fill("#password", "P@ssword123");

    await page.click("#loginBtn");

    const successMsg = page.locator("#successMessage");
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toContainText("เข้าสู่ระบบสำเร็จ");
  });
});
