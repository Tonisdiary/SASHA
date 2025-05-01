# EAS Build Instructions

This document provides instructions for setting up and using EAS Build with your Study Buddy app.

## What is EAS?

EAS (Expo Application Services) is a set of cloud services designed specifically for Expo and React Native apps. EAS Build allows you to build your app for iOS and Android without needing Xcode or Android Studio installed on your machine.

## Setup Instructions

### 1. Install EAS CLI

First, run the `install-eas.bat` script to install the EAS CLI locally in your project:

```
.\install-eas.bat
```

This script will install the EAS CLI as a development dependency in your project.

### 2. Fix EAS CLI Version

Run the `fix-eas-version.bat` script to fix the EAS CLI version constraint in your eas.json file:

```
.\fix-eas-version.bat
```

This script will update the eas.json file to use the correct version constraint for your installed EAS CLI.

### 3. Initialize EAS Project

Run the `eas-init.bat` script to initialize your EAS project:

```
.\eas-init.bat
```

This script will link your local project to your EAS project on Expo's servers.

### 4. Fix EAS Project Configuration

If you encounter any issues with the EAS project configuration, run the `fix-eas-project.bat` script:

```
.\fix-eas-project.bat
```

This script will fix the EAS project configuration by creating a proper .easconfig file and updating app.json.

### 5. Log in to EAS

Run the `eas-login.bat` script to log in to your Expo account:

```
.\eas-login.bat
```

You'll need to have an Expo account to use EAS Build. If you don't have one, you can create one at [expo.dev](https://expo.dev/signup).

### 6. Build Your App

Run the `eas-build.bat` script to build your app:

```
.\eas-build.bat
```

This script will guide you through the process of building your app for iOS and/or Android.

## Build Profiles

The `eas.json` file contains three build profiles:

1. **Development**: For development builds with the Expo development client. iOS builds include simulator support.
2. **Preview**: For internal testing builds.
3. **Production**: For production builds to be submitted to the App Store and Google Play.

## Troubleshooting

If you encounter any issues:

1. Make sure you're logged in to EAS (`.\eas-login.bat`)
2. Check that your EAS project is configured correctly (`.\setup-eas.bat`)
3. Ensure you have a valid Expo account
4. Check your internet connection

## Manual Commands

If you prefer to use the command line directly:

```
# Log in to EAS
npx eas login

# Build for iOS development (simulator)
npx eas build --platform ios --profile development

# Build for Android development
npx eas build --platform android --profile development

# Build for production
npx eas build --platform all --profile production
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)