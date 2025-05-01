# Study Buddy Migration Guide

This guide will help you migrate your Study Buddy app to a new Expo project with the latest version.

## Step 1: Create a new project

Run the `create-new-project.bat` script or use the following command:

```bash
npx create-expo-app@latest study-buddy-new --template blank-typescript
```

## Step 2: Copy your code

Copy the following directories and files from your old project to the new one:

- `app/` directory (contains your app screens and navigation)
- `components/` directory (contains your UI components)
- `hooks/` directory (contains your custom hooks)
- `lib/` directory (contains your utility functions)
- `assets/` directory (contains your images and fonts)
- `types/` directory (contains your TypeScript type definitions)
- `.env` file (contains your environment variables)

## Step 3: Update dependencies

Update the `package.json` file in your new project to include the dependencies from your old project. Make sure to keep the core dependencies from the new project.

## Step 4: Install dependencies

Run the following command in your new project directory:

```bash
npm install
```

## Step 5: Update configuration files

Copy and update the following configuration files:

- `babel.config.js`
- `app.json`
- `tsconfig.json`

Make sure to adapt them to the new project structure if needed.

## Step 6: Run the app

Run the following command in your new project directory:

```bash
npx expo start
```

## Troubleshooting

If you encounter any issues:

1. Check the console for error messages
2. Make sure all dependencies are installed
3. Check for compatibility issues between dependencies
4. Try running with the `--clear` flag: `npx expo start --clear`

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)