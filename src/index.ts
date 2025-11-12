import * as core from "@actions/core";
import * as github from "@actions/github";

(async function run(): Promise<void> {
  try {
    const authKey = core.getInput("auth-key");
    if (!authKey) {
      core.setFailed("Missing required input: auth-key");
      return;
    }

    const baseBranch =
      github.context.eventName === "pull_request"
        ? github.context.payload.pull_request?.base.ref
        : undefined;
    const headBranch =
      github.context.eventName === "pull_request"
        ? github.context.payload.pull_request?.head.ref
        : undefined;

    if (!baseBranch || !headBranch) {
      core.setFailed(
        "This action must be triggered by a pull_request event with valid base and head branches",
      );
      return;
    }
    console.log(
      `Merging branch '${headBranch}' into '${baseBranch}' in Empirical test repository`,
    );

    const response = await fetch(
      "https://dash.empirical.run/api/projects/merge-branches",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({
          base_branch: baseBranch,
          head_branch: headBranch,
        }),
      },
    );

    const content = await response.text();
    if (!response.ok) {
      core.setFailed(`Merge branches API failed: ${content}`);
    } else {
      console.log("Merge branches request successful");
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
})();
