import { useRouter, type RelativePathString, type ExternalPathString } from 'expo-router';

export function useTypedNavigation() {
  const router = useRouter();

  function replace(path: RelativePathString | ExternalPathString) {
    router.replace(path);
  }

  function push(path: RelativePathString | ExternalPathString) {
    router.push(path);
  }

  return {
    replace,
    push,
  };
}
