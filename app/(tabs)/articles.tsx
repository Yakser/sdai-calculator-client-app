import React, { useState, useEffect } from 'react'
import { FlatList, StyleSheet, ActivityIndicator, View } from 'react-native'
import { Button, Text } from 'react-native-paper'

import { Article, getMockAPISDAI } from '@/api/generated/articles_client'
import { SafeAreaView } from 'react-native-safe-area-context'
import Markdown from 'react-native-markdown-display'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    borderRadius: 5,
    marginTop: 20,
    padding: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  markdownStyles: {
    body: {
      fontSize: 14, // Размер текста для основного контента
      lineHeight: 20,
      color: '#333',
    },
    heading1: {
      fontSize: 20, // Заголовок уровня 1 (уменьшили до 20)
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 5,
    },
    heading2: {
      fontSize: 18, // Заголовок уровня 2
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 5,
    },
    heading3: {
      fontSize: 16, // Заголовок уровня 3
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 5,
    },
    listItem: {
      fontSize: 14,
      lineHeight: 20,
      color: '#333',
    },
  },
  safeContainer: {
    flex: 1,
  },
})

const ArticlesScreen = () => {
  const [items, setItems] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = getMockAPISDAI()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.getArticles()
      setItems(response.data)
    } catch (err) {
      setError('Не удалось загрузить данные. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderItem = ({ item }: { item: Article }) => (
    <View style={styles.item}>
      <Markdown style={styles.markdownStyles}>{item.content}</Markdown>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Управление ресурсами</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Button onPress={fetchData} disabled={isLoading}>
          Обновить данные
        </Button>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.title || ''}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default ArticlesScreen
