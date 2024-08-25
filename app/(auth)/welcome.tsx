import { View, Text, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Swiper from 'swiper'


const welcome = () => {

    const swiperRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)
  return (
    <SafeAreaView className="flex h-full justify-end flex-row bg-slate-300">
        <TouchableOpacity onPress={()=>{router.replace(href= "/(auth)/sign-up")}}>
            <Text className="text-xl font-JakartaBold mx-6 my-2">Skip</Text>
        </TouchableOpacity>
        <Swiper
        ref={swiperRef}
        loop={false}
        dot= {<View/>}
        activeDot = {<View/>}
        onIndexChanged= {(index) =>setActiveIndex(index)}
        >

        </Swiper>
    </SafeAreaView>
  )
}

export default welcome