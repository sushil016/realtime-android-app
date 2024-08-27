import { Link, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  // const { isSignedIn } = useAuth();

  // if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;

  return <Redirect href="/(auth)/sign-up" />
    // <SafeAreaView>
    //   <Link className="" href={"/(auth)/welcome"}>hii</Link>
    // </SafeAreaView>
  
};