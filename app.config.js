const config = {
  name: "Study Buddy",
  slug: "study-buddy",
  version: "1.0.0",
  sdkVersion: "52.0.0",
  orientation: "portrait",
  scheme: "studybuddy",
  userInterfaceStyle: "automatic",
  jsEngine: "hermes",
  newArchEnabled: true,
  plugins: [
    "expo-router",
    "expo-document-picker",
    "react-native-maps"
  ],
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.studyapp",
    config: {
      usesNonExemptEncryption: false
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "Allow Study App to use your location.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "Allow Study App to use your location.",
      NSLocationAlwaysUsageDescription: "Allow Study App to use your location."
    }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FFFFFF"
    },
    package: "com.yourcompany.studyapp",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION"
    ]
  },
  web: {
    bundler: "metro",
    output: "static"
  },
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  projectId: "b0829ebb-4926-4d9b-9d34-1a16db43d4eb",
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "b0829ebb-4926-4d9b-9d34-1a16db43d4eb"
    }
  },
  owner: "tonis.diary"
};

export default {
  expo: config
};
