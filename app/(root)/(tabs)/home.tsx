import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView>
      <Text className="text-3xl bg-black text-white px-4 py-2">hii this is home page baby !</Text>
    </SafeAreaView>
  );
}