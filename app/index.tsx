import { Link, Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";





export default function Index() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  async function getData(){
    const data = await AsyncStorage.getItem('isLoggedIn');
    setIsLoggedIn(data === 'true');
    console.log("data of isloggedin", data);
    
  }
  useEffect(()=>{
    getData()
  },[])
  // const { isSignedIn } = useAuth();

  // if (isLoggedIn) return <Redirect href="/(root)/(tabs)/home" />

  return isLoggedIn? <Redirect href="/(root)/(tabs)/home" /> : <Redirect href="/(root)/(tabs)/home"/>
  
  //<Redirect href="/(auth)/sign-up" />
    // <SafeAreaView>
    //   <Link className="" href={"/(auth)/welcome"}>hii</Link>
    // </SafeAreaView>
  
};