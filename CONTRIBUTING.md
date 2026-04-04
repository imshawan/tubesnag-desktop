# Contributing to TubeSnag Desktop

First off, thank you for considering contributing to TubeSnag Desktop!

As an enterprise-grade media extraction client, we prioritize stability, security, local data privacy, and a seamless user experience. To maintain these standards, we have established strict guidelines for code contributions, bug reports, and feature requests.

Please read this document carefully before submitting a Pull Request (PR) or opening an issue.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Development Workflow](#development-workflow)
3. [Branching Strategy](#branching-strategy)
4. [Coding Standards & Tooling](#coding-standards--tooling)
5. [Commit Message Conventions](#commit-message-conventions)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs & Requesting Features](#reporting-bugs--requesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by standard open-source professional conduct. Be respectful, constructive, and collaborative in all interactions. Harassment or toxic behavior will not be tolerated.

---

## Development Workflow

Before starting work, ensure your local environment is set up according to the [Developer Onboarding section in the README](README.md#developer-onboarding).

1. **Fork the repository** and clone it locally.
2. **Sync your fork** with the upstream `main` branch.
3. **Create a new branch** for your feature or bug fix.
4. **Implement your changes** iteratively.
5. **Run local validation checks** (linting, formatting).
6. **Push your branch** and open a Pull Request.

---

## Branching Strategy

We follow a structured branching model. Please name your branches using the following prefixes to indicate the nature of your work:

* `feature/<short-description>`: For new features or enhancements.
* `fix/<short-description>`: For bug fixes.
* `docs/<short-description>`: For documentation updates.
* `chore/<short-description>`: For tooling, dependency updates, or maintenance.

*Example: `feature/bulk-download-improvements` or `fix/audio-bitrate-parsing`*

---

## Coding Standards & Tooling

TubeSnag utilizes rigorous static analysis to maintain code health. We rely on **TypeScript** for type safety, **Biome** for blazing-fast formatting/linting, and **Ultracite** for extended rule enforcement.

### General Guidelines
* **TypeScript Strict Mode:** All code must be strictly typed. Avoid `any` at all costs; use `unknown` if a type cannot be immediately determined.
* **Functional React:** Use functional components and React Hooks (React 19). Avoid class components.
* **Styling:** Use Tailwind CSS (v4) utility classes. Extract complex, reused UI elements into reusable Shadcn/Radix components rather than inline styles.

### Pre-Commit Validation
Before committing, you **must** ensure your code passes our CI requirements locally:

```bash
# Run static analysis and type-checking
npm run check

# Auto-fix formatting and linting violations
npm run fix
```


_Note: Any PR that fails the `npm run check` step in our CI pipeline will be automatically blocked from merging._

----------

## Commit Message Conventions

We enforce [Conventional Commits](https://www.conventionalcommits.org/). This allows us to auto-generate changelogs and maintain a readable Git history.

**Format:**

```
<type>(<optional scope>): <description>

```

**Types:**

-   `feat:` A new feature

-   `fix:` A bug fix

-   `docs:` Documentation only changes

-   `style:` Changes that do not affect the meaning of the code (white-space, formatting)

-   `refactor:` A code change that neither fixes a bug nor adds a feature

-   `perf:` A code change that improves performance

-   `test:` Adding missing tests or correcting existing tests

-   `chore:` Changes to the build process or auxiliary tools


**Examples:**

-   `feat(downloads): add support for 8K HDR extraction`

-   `fix(ipc): resolve memory leak in ffmpeg process termination`

-   `docs: update translation guidelines for hindi locale`


----------

## Pull Request Process

When you are ready to submit your code, open a Pull Request against the `main` branch.

1.  **Use the PR Template:** Fill out the provided Pull Request template completely.

2.  **Link Issues:** If your PR resolves an open issue, link it using closing keywords (e.g., `Resolves #123`).

3.  **Keep it Focused:** A PR should address a single concern (one feature or one bug). Do not bundle unrelated changes together.

4.  **Clean Git History:** If your branch has a messy commit history (e.g., `fix typo`, `update again`), please squash your commits before requesting a review.

5.  **Review Phase:** A core maintainer will review your code. Be prepared to address feedback, make changes, and push updates to your branch.


----------

## Reporting Bugs & Requesting Features

### Bug Reports

If you find a bug, please check the existing issues first to avoid duplicates. If it's a new bug, open an issue and include:

-   **Environment details:** OS version, Node version, TubeSnag version.

-   **Steps to reproduce:** A clear, step-by-step guide to triggering the bug.

-   **Expected vs. Actual behavior.**

-   **Logs:** Any relevant error outputs from the console or Electron main process.


### Feature Requests

We love feature requests! Please open an issue with the `enhancement` label and include:

-   **The Problem:** What current limitation or pain point does this solve?

-   **The Solution:** How do you envision the feature working (UI/UX and technical implementation)?

-   **Alternatives:** Any workarounds or alternative approaches you considered.


----------

Thank you for contributing to TubeSnag Desktop! 🚀