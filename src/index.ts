import * as core from "@actions/core";
import * as github from "@actions/github";
import createClient from "openapi-fetch";
import type { paths } from "./generated/api-worker-openapi";

const apiWorkerUrl = "https://api.empirical.run";
const mergeBranchesPath = "/api/projects/merge-branches";

function formatApiError(error: unknown): string {
  if (error == null) {
    return "";
  }
  return typeof error === "string" ? error : JSON.stringify(error);
}

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

    const client = createClient<paths>({
      baseUrl: apiWorkerUrl,
      headers: {
        Authorization: `Bearer ${authKey}`,
      },
    });
    const { error, response } = await client.POST(mergeBranchesPath, {
      body: {
        base_branch: baseBranch,
        head_branch: headBranch,
      },
    });

    if (!response.ok) {
      const status = `${response.status} ${response.statusText || "Unknown status"}`;
      const requestUrl = `${apiWorkerUrl}${mergeBranchesPath}`;
      const finalUrl = response.url || requestUrl;
      core.setFailed(
        [
          `Merge branches API failed (${status})`,
          `Request: POST ${requestUrl}`,
          ...(finalUrl === requestUrl
            ? []
            : [`Final URL after redirects: ${finalUrl}`]),
          `Response: ${formatApiError(error) || "<empty response body>"}`,
        ].join("\n"),
      );
    } else {
      console.log("Merge branches request successful");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(
      `Merge branches request failed before receiving a response from ${apiWorkerUrl}${mergeBranchesPath}: ${message}`,
    );
  }
})();
