import React, { useCallback, useState } from 'react'
import {
  getSDAICalculatorAPIServer,
  HistoryRecord,
} from '@/api/generated/calculator_client'
import { ActivityIndicator, Text, Button, TextInput } from 'react-native-paper'
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LineChart } from 'react-native-chart-kit'
import { useFocusEffect } from '@react-navigation/native'

const ITEMS_PER_PAGE = 10

const styles = StyleSheet.create({
  buttonText: {
    color: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    marginBottom: Platform.select({
      ios: 83,
      android: 0,
    }),
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pageInput: {
    padding: 0,
    textAlign: 'center',
    width: 70,
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  refreshButton: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tableCell: {
    flex: 1,
    minWidth: 150,
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'center',
  },
  tableContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tableHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
})

const HistoryScreen: React.FC = () => {
  const api = getSDAICalculatorAPIServer()

  const [loading, setLoading] = useState<boolean>(true)
  const [dataHistory, setDataHistory] = useState<HistoryRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState<number>(0)
  const [selectedPage, setSelectedPage] = useState<string>('1')

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getHistory()

      setDataHistory(response.data.history.reverse())
    } catch (err) {
      console.error('Ошибка загрузки данных истории:', err)
      setError('Не удалось загрузить данные. Проверьте подключение.')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadHistory()
    }, []),
  )

  const getPaginatedData = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return dataHistory.slice(startIndex, endIndex)
  }

  const handleNextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < dataHistory.length) {
      setCurrentPage(prev => prev + 1)
      setSelectedPage((currentPage + 2).toString())
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      setSelectedPage(currentPage.toString())
    }
  }

  const handlePageInputChange = (text: string) => {
    const pageNumber = parseInt(text, 10)

    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > Math.ceil(dataHistory.length / ITEMS_PER_PAGE)
    ) {
      setError(
        `Введите корректный номер страницы (1-${Math.ceil(dataHistory.length / ITEMS_PER_PAGE)})`,
      )
    } else {
      setError(null)
      setCurrentPage(pageNumber - 1)
    }

    setSelectedPage(text)
  }

  const getPaginatedGraphData = () => {
    return getPaginatedData()
  }

  const renderChart = () => {
    if (error && currentPage === 0 && !dataHistory.length) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )
    }

    if (!dataHistory.length) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>
            Нет данных для отображения истории.
          </Text>
        </View>
      )
    }

    const paginatedGraphData = getPaginatedGraphData()
    const labels = paginatedGraphData.map((entry, index) =>
      index % 2 === 0
        ? new Date(entry.measure_datetime).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
          })
        : '',
    )

    const graphData = paginatedGraphData.map(entry => entry.sdai_index)

    return (
      <LineChart
        fromZero
        data={{ labels, datasets: [{ data: graphData, strokeWidth: 2 }] }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#f0f8ff',
          backgroundGradientFrom: '#87CEEB',
          backgroundGradientTo: '#4682B4',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 10 },
          propsForLabels: { fontSize: 10 },
        }}
        style={{ marginVertical: 10, borderRadius: 10 }}
        withInnerLines={false}
        withVerticalLines={false}
        bezier
      />
    )
  }

  const renderTable = () => {
    const paginatedData = getPaginatedData()

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableHeader}>Таблица истории</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                Дата измерения
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                SDAI индекс
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                Болезненные суставы
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                Отёчные суставы
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                Оценка врача
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                Оценка пациента
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                CRP (мг/дл)
              </Text>
            </View>

            {paginatedData.map((entry, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? '#f3f3f3' : '#ffffff' },
                ]}
              >
                <Text style={styles.tableCell}>
                  {new Date(entry.measure_datetime).toLocaleString('ru-RU')}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.sdai_index.toFixed(2)}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.parameters.painful_joints}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.parameters.swollen_joints}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.parameters.physician_activity_assessment}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.parameters.patient_activity_assessment}
                </Text>
                <Text style={styles.tableCell}>
                  {entry.parameters.crp.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.paginationContainer}>
          <Button
            mode="contained"
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          >
            <Text style={styles.buttonText}>Назад</Text>
          </Button>
          <TextInput
            mode="outlined"
            value={selectedPage}
            style={styles.pageInput}
            keyboardType="numeric"
            onChangeText={handlePageInputChange}
          />
          <Button
            mode="contained"
            onPress={handleNextPage}
            disabled={(currentPage + 1) * ITEMS_PER_PAGE >= dataHistory.length}
          >
            <Text style={styles.buttonText}>Вперед</Text>
          </Button>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>История SDAI</Text>
        <Button
          mode="contained"
          onPress={loadHistory}
          style={styles.refreshButton}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Обновить данные</Text>
        </Button>
        {loading && (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#4682B4" />
          </View>
        )}
        {dataHistory.length > 0 && renderChart()}
        {dataHistory.length > 0 && renderTable()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HistoryScreen
