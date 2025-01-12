import React from 'react'
import { StyleSheet, Text } from 'react-native'

const styles = StyleSheet.create({
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
})

type SDAIResultProps = {
  sdai: number
}

const SDAIResult: React.FC<SDAIResultProps> = ({ sdai }) => {
  const interpretResults = (calculatedSDAI: number): string => {
    if (calculatedSDAI < 3.3) {
      return 'Ремиссия'
    }

    if (calculatedSDAI <= 11) {
      return 'Низкая активность заболевания'
    }
    if (calculatedSDAI <= 26) {
      return 'Умеренная активность заболевания'
    }

    return 'Высокая активность заболевания'
  }
  return (
    <>
      <Text style={styles.resultText}>Результат SDAI: {sdai.toFixed(1)}</Text>
      <Text style={styles.resultText}>
        Активность: {interpretResults(sdai)}
      </Text>
    </>
  )
}

export default SDAIResult
