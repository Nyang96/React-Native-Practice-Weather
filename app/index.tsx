import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as Location from 'expo-location'
import { Feather } from '@expo/vector-icons'
import axios from 'axios'

interface DaysData {
  dt_txt: string
  main: {
    temp: number
    temp_max: number
    temp_min: number
    humidity: number
  }
  weather: {
    main: string
  }[]
  wind: {
    speed: number
  }
}

interface TodayDate {
  date: string
  weekDay: string
}
type IconNameTypes = 'sun' | 'cloud' | 'cloud-snow' | 'cloud-rain' | 'cloud-drizzle' | 'cloud-lightning'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const API_KEY = 'bd19d67edadc9b31b5a2018dc9fb27e1'
const Icons: { [key: string]: string } = {
  Clear: 'sun',
  Clouds: 'cloud',
  Snow: 'cloud-snow',
  Rain: 'cloud-rain',
  Drizzle: 'cloud-drizzle',
  Thunderstorm: 'cloud-lightning',
}

export default function Index() {
  const [city, setCity] = useState<string | null>('...Loading')
  const [ok, setOk] = useState<boolean>(true)
  const [days, setDays] = useState<DaysData[]>([])
  const [today, setToday] = useState<TodayDate>({ date: '...Loading', weekDay: '' })

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync()
    if (!granted) {
      setOk(false)
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 })
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false })
    const currentLocation = location[0]?.city
    setCity(currentLocation)

    await axios
      .get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`
      )
      .then((res) => {
        const listData: DaysData[] = res.data.list
        const newListData = listData.filter((list) => {
          if (list.dt_txt.includes('12:00:00')) {
            return list
          }
        })
        setDays(newListData)
      })
  }

  const todayDate = () => {
    const date = new Date()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dayOfWeek = date.getDay()

    const getDayOfWeekText = (dayOfWeek: number) => {
      const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      return daysOfWeek[dayOfWeek]
    }
    const weekDay = getDayOfWeekText(dayOfWeek)
    setToday({ date: `${month}월${day}일`, weekDay })
  }

  useEffect(() => {
    todayDate()
    getWeather()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#708090" />
      <View style={styles.city}>
        <Text style={styles.cityText}>{city}</Text>
      </View>
      <View style={styles.date}>
        <Text style={styles.dateMonth}>{today.date}</Text>
        <Text style={styles.dateWeek}>{today.weekDay}</Text>
      </View>
      <View style={styles.weatherContainer}>
        {days.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weather}
          >
            {days.map((day, index) => {
              const {
                main: { temp, temp_max, temp_min, humidity },
                wind: { speed },
              } = day
              const weatherIcon = Icons[day.weather[0].main] as IconNameTypes

              return (
                <View key={index} style={styles.dayWeather}>
                  <View style={styles.weatherPrev}>
                    <Text style={styles.temp}>{temp.toFixed(0)}℃</Text>
                    <Text style={styles.description}>{day.weather[0].main}</Text>
                    <View style={{ flex: 2.5, alignItems: 'flex-end', paddingTop: 30, paddingRight: 50 }}>
                      <Feather name={weatherIcon} size={120} color="#708090" />
                    </View>
                  </View>
                  <View style={styles.weatherDetail}>
                    <View>
                      <Text style={styles.weatherBoldText}>{temp_max.toFixed(0)} ℃</Text>
                      <Text style={styles.weatherText}>{temp_min.toFixed(0)} ℃</Text>
                    </View>
                    <View>
                      <Text style={styles.weatherBoldText}>습도 {humidity}%</Text>
                      <Text style={styles.weatherText}>바람 {speed}km/h</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#708090',
  },
  city: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 42,
    fontWeight: '600',
    color: '#fff',
  },
  date: {
    flex: 2,
    justifyContent: 'center',
    paddingLeft: 30,
  },
  dateMonth: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
  },
  dateWeek: {
    marginTop: 10,
    fontSize: 24,
    color: '#fff',
  },
  weatherContainer: {
    flex: 5,
  },
  weather: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  dayWeather: {
    flexGrow: 1,
    width: SCREEN_WIDTH,
  },
  weatherPrev: {
    flex: 3,
    justifyContent: 'center',
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 15,
    backgroundColor: '#f8f8ff',
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
  },
  temp: {
    flex: 2,
    fontSize: 130,
    fontWeight: '700',
    color: '#708090',
  },
  description: {
    flex: 0.8,
    fontSize: 36,
    color: '#708090',
  },
  weatherDetail: {
    flex: 1.3,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weatherBoldText: {
    fontWeight: '600',
    fontSize: 20,
    color: '#fff',
  },
  weatherText: {
    fontSize: 20,
    color: '#fff',
  },
})
