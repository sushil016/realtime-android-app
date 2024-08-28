import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import { router } from "expo-router";
import { Text, View , FlatList, Image, TouchableOpacity, Alert} from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const DATA = [
  {
    id: '1',
    title: 'Mumbai'
  },
  {
    id: '2',
    title: 'pune',
  },
  {
    id: '3',
    title: 'banglore',
  },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View>
    <Text className="text-2xl flex items-center justify-center bg-slate-300">{title}</Text>
  </View>
);

export default function Home() {

  function handleSignOut (){
    
    router.replace("/(auth)/sign-in");
  }

  function handleDestinationPress(){
    Alert.alert("location checked")
  }
  return (
    <SafeAreaView>
      <FlatList
         data={DATA}
         renderItem={({item}) => <Item className="text-3xl" title={item.title} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
          <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold ml-4">
                Welcome 👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 mr-2 rounded-full bg-zinc-200"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300 mx-3"
              handlePress={handleDestinationPress}
            />
            <>
                <Text className="text-xl font-JakartaBold mt-5 mb-3 mx-2">
                Your current location
              </Text>
              <View className="w-full h-[300px] flex">
                <MapView/>
              </View>
            </>
            
          </>
          
        }
      />
    </SafeAreaView>
  );
}