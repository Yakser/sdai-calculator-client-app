import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native'
import {
  TextInput,
  Button,
  HelperText,
  Text,
  Portal,
  ActivityIndicator,
  Snackbar,
  IconButton,
} from 'react-native-paper'
import { DatePickerModal, registerTranslation } from 'react-native-paper-dates'
import {
  getSDAICalculatorAPIServer,
  CalculateRequest,
  Error,
} from '@/api/generated/client'

const TABS_HEIGHT = 83

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
  },
  calculateButton: { backgroundColor: '#5885DC', flex: 0.48 },
  clearButton: { backgroundColor: '#BB2649', flex: 0.48 },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  input: { marginBottom: 10 },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  safeArea: { backgroundColor: '#FFF', flex: 1, marginBottom: TABS_HEIGHT },
  snackbarWrapper: {
    position: 'absolute',
    top: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
})

registerTranslation('ru', {
  close: 'Закрыть',
  dateIsDisabled: 'Дата недоступна',
  hour: 'Час',
  minute: 'Минута',
  mustBeBetween(startDate: string, endDate: string): string {
    return `Дата должна быть между ${startDate} и ${endDate}`
  },
  mustBeHigherThan(date: string): string {
    return `Дата должна быть после ${date}`
  },
  mustBeLowerThan(date: string): string {
    return `Дата должна быть до ${date}`
  },
  next: 'Следующий',
  notAccordingToDateFormat(inputFormat: string): string {
    return `Неправильный формат даты. Ожидается: ${inputFormat}`
  },
  pickDateFromCalendar: 'Выберите дату из календаря',
  previous: 'Предыдущий',
  selectMultiple: 'Выберите несколько дат',
  typeInDate: 'Введите дату',
  save: 'Сохранить',
  selectSingle: 'Выбор даты',
  selectRange: 'Выбрать период',
})

const HomeScreen: React.FC = () => {
  const api = getSDAICalculatorAPIServer()
  const [loading, setLoading] = useState<boolean>(false)

  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const showSnackbar = (message: string) => {
    setErrorMessage(message)
    setSnackbarVisible(true)
  }

  const isDevelopment = __DEV__
  const [tenderJoints, setTenderJoints] = useState<string>(
    isDevelopment ? '5' : '',
  )
  const [swollenJoints, setSwollenJoints] = useState<string>(
    isDevelopment ? '3' : '',
  )
  const [physicianAssessment, setPhysicianAssessment] = useState<string>(
    isDevelopment ? '50' : '',
  )
  const [patientAssessment, setPatientAssessment] = useState<string>(
    isDevelopment ? '40' : '',
  )
  const [crp, setCrp] = useState<string>(isDevelopment ? '3.5' : '')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [sdai, setSdai] = useState<number | null>(null)
  const [interpretation, setInterpretation] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDatePicker, setShowDatePicker] = useState(false)

  const clearFields = () => {
    setTenderJoints('')
    setSwollenJoints('')
    setPhysicianAssessment('')
    setPatientAssessment('')
    setCrp('')
    setSdai(null)
    setInterpretation('')
    setErrors({})
    setSelectedDate(new Date())
  }

  const validateInput = () => {
    const newErrors: Record<string, string> = {}

    if (
      isNaN(Number(tenderJoints)) ||
      Number(tenderJoints) < 0 ||
      Number(tenderJoints) > 28
    ) {
      newErrors.tenderJoints =
        'Число болезненных суставов должно быть от 0 до 28'
    }
    if (
      isNaN(Number(swollenJoints)) ||
      Number(swollenJoints) < 0 ||
      Number(swollenJoints) > 28
    ) {
      newErrors.swollenJoints =
        'Число припухших суставов должно быть от 0 до 28'
    }
    if (
      isNaN(Number(physicianAssessment)) ||
      Number(physicianAssessment) < 0 ||
      Number(physicianAssessment) > 100
    ) {
      newErrors.physicianAssessment =
        'Оценка активности врачом должна быть от 0 до 100'
    }
    if (
      isNaN(Number(patientAssessment)) ||
      Number(patientAssessment) < 0 ||
      Number(patientAssessment) > 100
    ) {
      newErrors.patientAssessment =
        'Оценка здоровья больным должна быть от 0 до 100'
    }
    if (isNaN(Number(crp)) || Number(crp) < 0) {
      newErrors.crp = 'С-реактивный белок должен быть положительным числом'
    }
    if (!selectedDate) {
      newErrors.date = 'Выберите дату записи результата'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const interpretResults = (calculatedSDAI: number) => {
    if (calculatedSDAI < 3.3) {
      setInterpretation('Ремиссия')
      return
    }

    if (calculatedSDAI <= 11) {
      setInterpretation('Низкая активность заболевания')
      return
    }
    if (calculatedSDAI <= 26) {
      setInterpretation('Умеренная активность заболевания')
      return
    }

    setInterpretation('Высокая активность заболевания')
  }

  const calculateSDAI = async () => {
    if (!validateInput()) return

    setLoading(true)

    const calculateRequest: CalculateRequest = {
      parameters: {
        crp: Number(crp),
        painful_joints: Number(tenderJoints),
        swollen_joints: Number(swollenJoints),
        patient_activity_assessment: Number(patientAssessment),
        physician_activity_assessment: Number(physicianAssessment),
      },
      measure_datetime: selectedDate!.toISOString(),
    }

    try {
      const response = await api.calculate(calculateRequest)

      setSdai(response.data.sdai_index)
      interpretResults(response.data.sdai_index)
    } catch (error: any) {
      console.error(error)

      if (error.response && error.response.data) {
        const apiError = error.response.data as Error

        showSnackbar(apiError.message || 'Произошла ошибка на сервере')
      } else {
        showSnackbar('Не удалось связаться с сервером. Проверьте подключение.')
      }
    } finally {
      setLoading(false)
    }
  }

  const hideSnackbar = () => {
    setSnackbarVisible(false)
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const isCalculateDisabled =
    !tenderJoints ||
    !swollenJoints ||
    !physicianAssessment ||
    !patientAssessment ||
    !crp ||
    !selectedDate

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Расчёт SDAI</Text>

        <TextInput
          mode="outlined"
          label="Число болезненных суставов (от 0 до 28)"
          keyboardType="numeric"
          value={tenderJoints}
          onChangeText={setTenderJoints}
          style={styles.input}
          error={!!errors.tenderJoints}
        />
        <HelperText type="error" visible={!!errors.tenderJoints}>
          {errors.tenderJoints}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Число припухших суставов (от 0 до 28)"
          keyboardType="numeric"
          value={swollenJoints}
          onChangeText={setSwollenJoints}
          style={styles.input}
          error={!!errors.swollenJoints}
        />
        <HelperText type="error" visible={!!errors.swollenJoints}>
          {errors.swollenJoints}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Оценка активности врачом (0-100)"
          keyboardType="numeric"
          value={physicianAssessment}
          onChangeText={setPhysicianAssessment}
          style={styles.input}
          error={!!errors.physicianAssessment}
        />
        <HelperText type="error" visible={!!errors.physicianAssessment}>
          {errors.physicianAssessment}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Оценка здоровья пациентом (0-100)"
          keyboardType="numeric"
          value={patientAssessment}
          onChangeText={setPatientAssessment}
          style={styles.input}
          error={!!errors.patientAssessment}
        />
        <HelperText type="error" visible={!!errors.patientAssessment}>
          {errors.patientAssessment}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Уровень СРБ (мг/дл)"
          keyboardType="numeric"
          value={crp}
          onChangeText={setCrp}
          style={styles.input}
          error={!!errors.crp}
        />
        <HelperText type="error" visible={!!errors.crp}>
          {errors.crp}
        </HelperText>

        <Button
          mode="outlined"
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.row}>
            <Text style={styles.dateText}>
              {selectedDate
                ? `Дата измерения: ${formatDate(selectedDate)}`
                : 'Выберите дату'}
            </Text>
            <IconButton icon="calendar" size={20} style={{ margin: 0 }} />
          </View>
        </Button>

        <HelperText type="error" visible={!!errors.date}>
          {errors.date}
        </HelperText>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={calculateSDAI}
            disabled={isCalculateDisabled}
            style={[
              styles.calculateButton,
              isCalculateDisabled && styles.disabledButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Рассчитать</Text>
            )}
          </Button>
          <Button
            mode="contained"
            onPress={clearFields}
            style={styles.clearButton}
          >
            <Text style={styles.buttonText}>Очистить</Text>
          </Button>
        </View>

        {sdai !== null && (
          <>
            <Text style={styles.resultText}>
              Результат SDAI: {sdai.toFixed(1)}
            </Text>
            <Text style={styles.resultText}>Активность: {interpretation}</Text>
          </>
        )}
      </ScrollView>

      <Portal>
        <DatePickerModal
          locale="ru"
          mode="single"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={selectedDate}
          onConfirm={params => {
            if (params.date) {
              setSelectedDate(params.date)
            }
            setShowDatePicker(false)
          }}
        />
      </Portal>

      {snackbarVisible && (
        <Snackbar
          visible={true}
          onDismiss={hideSnackbar}
          duration={3000}
          wrapperStyle={styles.snackbarWrapper}
        >
          {errorMessage}
        </Snackbar>
      )}
    </SafeAreaView>
  )
}

export default HomeScreen
