import { View, Text, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import { icons, images } from '@/constants'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import Line from '@/components/Line'
import { Link, router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'


const Signup = () => {

  const [form, setForm] = useState({
    email:"",
    password:""}
  )

  function SigninPressHandler (){
    const signinData = {
      email: form.email,
      password: form.password
    }

    if (form.email && form.password) {
      axios.post("http://192.168.1.157:8080/api/v2/login",signinData)
         .then(res => {
          console.log(res.data);
          if (res.data.success == true) {
            Alert.alert("Login Successful")
            AsyncStorage.setItem('token',res.data.token)
            AsyncStorage.setItem('isLoggedIn' , JSON.stringify(true))
            router.push("/(root)/(tabs)/home")
          }else{
            Alert.alert(JSON.stringify(res.data))
          }
         })
         .catch(e => console.log(e))
    }else{
      Alert.alert("flease fill all the details")
    }
  }

  return (
   <ScrollView>
     <View classname="h-full bg-white">
         <View className="w-full bg-white relative h-[250px]">
              <Image 
                source={images.signUpCar}
                className="z-0 w-full h-[250px]"
              />
              <Text className="font-bold text-black text-xl absolute bottom-5 left-5">Enter your Credentials to proceed</Text>
         </View>
         <View className="p-2">
          <InputField 
          label="Email"
          icon={icons.email}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField 
          label="Password"
          icon={icons.lock}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
          />
         </View>

         <CustomButton 
         title="Login"
         className='p-4 w-[300px] ml-8 my-4'
         onPress={SigninPressHandler}
         />
         <Line/>

         <CustomButton
         title="Login with Google"
         className="my-5 w-[300px] ml-8 my=4"
         IconLeft={()=>{
          <Image
          source={icons.google}
          resizeMode='contain'
          className="w-5 h-5 mx-2"
           />
         }} 
         bgVariant="outline"
         textVariant="primary"
         />

         <View className="flex items-center">
          <Text>Don't Have an account?{""} <Link className='text-blue-500' href="/(auth)/sign-up"> Sign-up</Link></Text>
         </View>
      </View>
   </ScrollView>
  )                                                                               
}

export default Signup