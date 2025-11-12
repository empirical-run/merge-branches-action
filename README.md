# Merge branches action

This action syncs branches from your application repository to your Empirical test repository. When a PR is merged, it automatically merges the corresponding branches in your test repo to keep them in sync.

## Usage

Add this workflow to your repository at `.github/workflows/merge-branches.yml`:

```yml
name: Merge branches in Empirical test repo

on:
  pull_request:
    types: [closed]

jobs:
  auto-merge:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Merge branches in Empirical
        uses: empirical-run/merge-branches-action@main
        with:
          auth-key: ${{ secrets.EMPIRICALRUN_KEY }}
```

## Inputs

- **auth-key** (required): Authentication key for the Empirical API. Store this as a GitHub secret.

## How it works

When a pull request is merged:
1. The action extracts the base branch (e.g., `main`) and the merged branch (e.g., `feature-branch`)
2. It calls the Empirical API to merge the corresponding branches in your test repository
3. This keeps your test repository in sync with your application repository
