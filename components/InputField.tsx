import {
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
  } from "react-native";

import { InputFieldProps } from "@/types/type";
import React from 'react'


const InputField = ({icon , label , iconStyle, inputStyle, containerStyle ,secureTextEntry, ...props} : InputFieldProps) => {
  return (
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
       <View className="w-full ">
           <Text className="text-lg font-JakartaBold ml-4 p-1">{label}</Text>
           <View
            className={`flex flex-row justify-start items-center relative bg-neutral-200 rounded-full border border-neutral-100 focus:border-primary-500  ${containerStyle}`}
          >
            {icon && (
              <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
            )}
            <TextInput
              className={`rounded-full p-3 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              secureTextEntry={secureTextEntry}
              {...props}
            />
          </View>
       </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  )
}

export default InputField