import { useFonts, Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

export function useAppFonts() {
  const [loaded] = useFonts({
    Sora_700Bold,
    Sora_400Regular,
    Inter_700Bold,
    Inter_400Regular,
  });
  return loaded;
}
