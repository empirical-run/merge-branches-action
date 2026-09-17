import * as core from "@actions/core";
import * as github from "@actions/github";

const mergeBranchesUrl =
  "https://api.empirical.run/api/projects/merge-branches";

void (async function run(): Promise<void> {
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

    const response = await fetch(mergeBranchesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authKey}`,
      },
      body: JSON.stringify({
        base_branch: baseBranch,
        head_branch: headBranch,
      }),
    });

    const content = (await response.text()).trim();
    if (!response.ok) {
      const status = `${response.status} ${response.statusText || "Unknown status"}`;
      const finalUrl = response.url || mergeBranchesUrl;
      core.setFailed(
        [
          `Merge branches API failed (${status})`,
          `Request: POST ${mergeBranchesUrl}`,
          ...(finalUrl === mergeBranchesUrl
            ? []
            : [`Final URL after redirects: ${finalUrl}`]),
          `Response: ${content || "<empty response body>"}`,
        ].join("\n"),
      );
    } else {
      console.log("Merge branches request successful");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(
      `Merge branches request failed before receiving a response from ${mergeBranchesUrl}: ${message}`,
    );
  }
})();
