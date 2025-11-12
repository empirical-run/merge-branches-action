import * as core from "@actions/core";
// import * as github from "@actions/github";

(async function run(): Promise<void> {
  try {
    // TODO: Add implementation
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
})();
