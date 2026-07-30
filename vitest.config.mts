import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    test: {
        include: ["test/**/*Test.ts", "test/**/*Tests.ts"],
        globals: true,
        browser: {
            enabled: true,
            instances: [
                {
                    browser: "chromium",
                    provider: playwright(),
                },
            ],
            headless: true,
        },
    }
});
