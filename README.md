# Merge branches action

## Usage

```yml
- name: Dispatch for tests
  uses: empirical-run/merge-branches-action@main
  with:
    auth-key: ${{ secrets.EMPIRICALRUN_KEY }}
```

Supported inputs

- [x] auth-key: **Required** input, for authentication.
