import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { icons } from "@/constants";
import { Stack } from "expo-router";
import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, View, StyleSheet } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 40,
      backgroundColor: focused ? "#0286FF" : "#0286FF",
      
    }}
  >
    <View
      style={{
        borderRadius: 40,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: focused ? "#0286FF" : undefined,
      }}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        style={styles.icon}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    color: "blue",
  },
});

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
       paddingBottom: 4,
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