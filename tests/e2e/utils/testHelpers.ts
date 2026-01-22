import * as fs from "fs";

interface StateData {
  authToken?: string;
  appUID?: string;
  contentTypeUID?: string;
  installationId?: string;
}

export class TestHelpers {
  static validateEnvironment(): void {
    const requiredEnv = [
      "CONTENTSTACK_LOGIN",
      "CONTENTSTACK_PASSWORD",
      "BASE_API_URL",
      "DEVELOPER_HUB_API",
      "CONTENTSTACK_ORGANIZATION_UID",
      "APP_HOST_URL",
    ];

    const missing = requiredEnv.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    const optional = ["STACK_API_KEY", "BASIC_AUTH_USERNAME", "BASIC_AUTH_PASSWORD"];
    const missingOptional = optional.filter((k) => !process.env[k]);
    if (missingOptional.length > 0) {
      console.log(`ℹ️ Optional env vars not set: ${missingOptional.join(", ")}`);
    }
  }

  static getStateData(): StateData {
    try {
      const raw = fs.readFileSync("tests/e2e/.state.json", "utf-8");
      return JSON.parse(raw) as StateData;
    } catch {
      return {};
    }
  }

  static logTestResult(testName: string, success: boolean, details?: string): void {
    const status = success ? "✅ PASSED" : "❌ FAILED";
    const message = `${status} [${testName}]${details ? ` - ${details}` : ""}`;
    if (success) console.log(message);
    else console.error(message);
  }
}
