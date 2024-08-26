import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView>
      <Text className="w-full h-full text-3xl bg-zinc-800 text-white">hii this is home page baby !</Text>
    </SafeAreaView>
  );
}