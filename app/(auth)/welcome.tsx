import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Swiper from "react-native-swiper";
import { onboarding } from '@/constants';
import CustomButton from '@/components/CustomButton';


const welcome = () => {

    const swiperRef = useRef<Swiper>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const isLastSlide = activeIndex === onboarding.length - 1;
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          onPress={() => router.replace("/(auth)/sign-up")}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(index) => setActiveIndex(index)}
        >
              {onboarding.map((item: { id: string; image: any; title: string; description: string; }) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.slideImage}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}

        </Swiper>
        <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-up")
            : swiperRef.current?.scrollBy(1)
        }
        style={styles.button}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#E2E8F0',
  },
  skipButton: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
  skipText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 290,
  },
  dot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
  },
  activeDot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: '#0286FF',
    borderRadius: 999,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  slideImage: {
    width: '100%',
    height: 300,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 40,
    color: '#000',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#858585',
    marginHorizontal: 40,
    marginTop: 12,
  },
  button: {
    width: '91.666667%',
    marginTop: 40,
    marginBottom: 20,
    marginLeft: 16,
  },
});

export default welcome