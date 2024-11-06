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
import { endpoints } from '@/utils/config'


const Signup = () => {

  const [form, setForm] = useState(
    {userName:"",
    email:"",
    password:""}
  )

  async function handleSubmit (){
    try {
      setLoading(true);
      if (!form.userName || !form.email || !form.password) {
        Alert.alert("Error", "Please fill all details");
        return;
      }

      const response = await axios.post(endpoints.signup, {
        userName: form.userName,
        email: form.email,
        password: form.password
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        Alert.alert("Success", "Account created successfully", [
          { text: "OK", onPress: () => router.replace("/(auth)/sign-in") }
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
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
              <Text className="font-bold text-black text-2xl absolute bottom-5 left-5"> Create your account </Text>
         </View>
         <View className="p-2">
          <InputField 
          label="Name"
          icon={icons.person}
          value={form.userName}
          onChangeText={(value)=>setForm({...form,userName:value})}
          />
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
         title="Sign-up"
         className='p-4 w-[300px] ml-8 my-4'
         //  onPress={signupHandler}
         onPress={handleSubmit}
         />
         <Line/>

         <CustomButton
         title="sign-up with Google"
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
          <Text>Already Have an account?{""} <Link className='text-blue-500' href="/(auth)/sign-in"> Sign-in</Link></Text>
         </View>
      </View>
   </ScrollView>
  )                                                                               
}

export default Signup