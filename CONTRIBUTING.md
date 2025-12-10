# Contributing to ExtmediaReproductor

First of all, thank you for considering contributing to this project! Any contribution is welcome.

## Getting Started

1.  **Fork the repository:** Click the "Fork" button on the top right of the repository page.
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/ExtmediaReproductor.git
    ```
3.  **Navigate to the project directory:**
    ```bash
    cd ExtmediaReproductor
    ```

## Dependency Management

This project uses [pnpm](https://pnpm.io/) to manage dependencies. To install the dependencies, run:

```bash
pnpm install
```

## Development Workflow

### Linting

This project uses [ESLint](https://eslint.org/) for static code analysis and [Prettier](https://prettier.io/) for code formatting. To check your code for issues, run:

```bash
pnpm lint
```

To automatically fix formatting issues, run:

```bash
pnpm format
```

### Building

To build the extension, you can use the following scripts:

- **Development build:**
  ```bash
  pnpm build
  ```
- **Release build:**
  ```bash
  pnpm build:release
  ```

The compiled extension will be located in the `dist/builds` directory.

## Submitting Changes

1.  **Create a new branch:**
    ```bash
    git checkout -b my-awesome-feature
    ```
2.  **Make your changes.**
3.  **Commit your changes:**
    ```bash
    git commit -m "feat: Add my awesome feature"
    ```
4.  **Push your changes to your fork:**
    ```bash
    git push origin my-awesome-feature
    ```
5.  **Create a pull request:** Open a pull request from your fork to the `main` branch of this repository.
