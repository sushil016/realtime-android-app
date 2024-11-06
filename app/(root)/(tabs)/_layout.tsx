import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { icons } from "@/constants";
import { Stack } from "expo-router";
import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, View } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}
  >
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-orange-400" : ""}`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className="w-4 h-4"
      />
    </View>
  </View>
);


export default function Layout() {



  return (
    <Tabs  initialRouteName="index" screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: "white",
      tabBarInactiveTintColor: "white",
      tabBarStyle:{
        backgroundColor:"#333333",
        borderRadius:1,
       overflow: "hidden",
       height: 70,
       paddingBottom: 45,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
      
      }

      }}>
     <Tabs.Screen 
     name="home"
    options={{title:"home" , 
      tabBarIcon: ({ focused }) => (
        <TabIcon source={icons.home} focused={focused} />
      ),
      }}
     />
     <Tabs.Screen 
     name="chat"
    options={{title:"Chats" , 
      tabBarIcon: ({ focused }) => (
        <TabIcon source={icons.chat} focused={focused} />
      ),
      }}
     />
     <Tabs.Screen 
     name="history"
    options={{title:"History" , 
      tabBarIcon: ({ focused }) => (
        <TabIcon source={icons.list} focused={focused} />
      ),
      }}
     />
     <Tabs.Screen 
     name="profile"
    options={{title:"Profile" , 
      tabBarIcon: ({ focused }) => (
        <TabIcon source={icons.profile} focused={focused} />
      ),
      }}
     />

     
    </Tabs>
  );
}