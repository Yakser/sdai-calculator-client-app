import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, SafeAreaView, Dimensions, Alert} from 'react-native';
import {TextInput, Button, HelperText, Text, Portal, ActivityIndicator, Snackbar} from 'react-native-paper';
import {DatePickerModal, registerTranslation} from 'react-native-paper-dates';
import {LineChart} from 'react-native-chart-kit';
import {getSDAICalculatorAPIServer, CalculateRequest} from '@/api/generated/client';
import {v4 as uuidv4} from 'uuid';
import {PanGestureHandler} from "react-native-gesture-handler";

const TABS_HEIGHT = 60;

// Регистрируем русскую локализацию
registerTranslation('ru', {
    close: "Закрыть",
    dateIsDisabled: "Дата недоступна",
    hour: "Час",
    minute: "Минута",
    mustBeBetween(startDate: string, endDate: string): string {
        return `Дата должна быть между ${startDate} и ${endDate}`;
    },
    mustBeHigherThan(date: string): string {
        return `Дата должна быть после ${date}`;
    },
    mustBeLowerThan(date: string): string {
        return `Дата должна быть до ${date}`;
    },
    next: "Следующий",
    notAccordingToDateFormat(inputFormat: string): string {
        return `Неправильный формат даты. Ожидается: ${inputFormat}`;
    },
    pickDateFromCalendar: "Выберите дату из календаря",
    previous: "Предыдущий",
    selectMultiple: "Выберите несколько дат",
    typeInDate: "Введите дату",
    save: 'Сохранить',
    selectSingle: 'Выбор даты',
    // today: 'Сегодня',
    selectRange: 'Выбрать период',
    // startDate: 'Начало периода',
    // endDate: 'Конец периода',
});

const App: React.FC = () => {
    const api = getSDAICalculatorAPIServer();
    const [loading, setLoading] = useState<boolean>(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const showSnackbar = (message: string) => {
        setErrorMessage(message);
        setSnackbarVisible(true);
    };

    const [tenderJoints, setTenderJoints] = useState<string>('');
    const [swollenJoints, setSwollenJoints] = useState<string>('');
    const [physicianAssessment, setPhysicianAssessment] = useState<string>('');
    const [patientAssessment, setPatientAssessment] = useState<string>('');
    const [crp, setCrp] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [dataHistory, setDataHistory] = useState<{ date: string; sdai: number }[]>([]);
    const [sdai, setSdai] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDatePicker, setShowDatePicker] = useState(false);

    const clearFields = () => {
        setTenderJoints('');
        setSwollenJoints('');
        setPhysicianAssessment('');
        setPatientAssessment('');
        setCrp('');
        setSdai(null);
        setInterpretation('');
        setErrors({});
        setSelectedDate(undefined);
    };

    const validateInput = () => {
        const newErrors: Record<string, string> = {};

        if (isNaN(Number(tenderJoints)) || Number(tenderJoints) < 0 || Number(tenderJoints) > 28) {
            newErrors.tenderJoints = 'Число болезненных суставов должно быть от 0 до 28';
        }
        if (isNaN(Number(swollenJoints)) || Number(swollenJoints) < 0 || Number(swollenJoints) > 28) {
            newErrors.swollenJoints = 'Число припухших суставов должно быть от 0 до 28';
        }
        if (isNaN(Number(physicianAssessment)) || Number(physicianAssessment) < 0 || Number(physicianAssessment) > 100) {
            newErrors.physicianAssessment = 'Оценка активности врачом должна быть от 0 до 100';
        }
        if (isNaN(Number(patientAssessment)) || Number(patientAssessment) < 0 || Number(patientAssessment) > 100) {
            newErrors.patientAssessment = 'Оценка здоровья больным должна быть от 0 до 100';
        }
        if (isNaN(Number(crp)) || Number(crp) < 0) {
            newErrors.crp = 'С-реактивный белок должен быть положительным числом';
        }
        if (!selectedDate) {
            newErrors.date = 'Выберите дату записи результата';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateSDAI = async () => {
        if (!validateInput()) return;

        setLoading(true);

        // Формируем запрос к API
        const calculateRequest: CalculateRequest = {
            crp: Number(crp),
            painful_joints: Number(tenderJoints),
            swollen_joints: Number(swollenJoints),
            patient_activity_assessment: Number(patientAssessment),
            physician_activity_assessment: Number(physicianAssessment),
            // Приводим дату к ISO формату
            measure_datetime: selectedDate!.toISOString(),
        };

        try {
            // todo: можно убрать

            const idempotencyToken = uuidv4();
            const response = await api.calculate(calculateRequest, {
                headers: {
                    'X-Idempotency-Token': idempotencyToken,
                },
            });

            const calculatedSDAI = response.data.sdai_index;

            setSdai(calculatedSDAI);

            // Интерпретация результата
            let activeness = '';
            if (calculatedSDAI < 3.3) {
                activeness = 'Ремиссия';
            } else if (calculatedSDAI <= 11) {
                activeness = 'Низкая активность заболевания';
            } else if (calculatedSDAI <= 26) {
                activeness = 'Умеренная активность заболевания';
            } else {
                activeness = 'Высокая активность заболевания';
            }
            setInterpretation(activeness);

            const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
            setDataHistory([...dataHistory, {date: formattedDate, sdai: calculatedSDAI}]);
        } catch (error: any) {
            if (error.response && error.response.data) {
                const apiError = error.response.data as { message: string };
                showSnackbar(apiError.message || 'Произошла ошибка на сервере');
            } else {
                showSnackbar('Не удалось связаться с сервером. Проверьте подключение.');
            }
        } finally {
            setLoading(false);
        }
    };

    const hideSnackbar = () => {
        setSnackbarVisible(false);
    };

    const gestureHandler = (event: any) => {
        if (event.nativeEvent.translationY < -50) {
            hideSnackbar(); // Скрыть Snackbar при движении вверх
        }
    };

    const isCalculateDisabled =
        !tenderJoints || !swollenJoints || !physicianAssessment || !patientAssessment || !crp || !selectedDate;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Индекс SDAI</Text>

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

                <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    {selectedDate
                        ? new Intl.DateTimeFormat('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        }).format(selectedDate)
                        : 'Выберите дату'}
                </Button>
                <HelperText type="error" visible={!!errors.date}>
                    {errors.date}
                </HelperText>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={calculateSDAI}
                        disabled={isCalculateDisabled}
                        style={styles.calculateButton}
                    >
                        {loading ? <ActivityIndicator animating={true} size="small" color="#fff"/> : 'Рассчитать'}
                    </Button>
                    <Button mode="contained" onPress={clearFields} style={styles.clearButton}>
                        Очистить
                    </Button>
                </View>

                {sdai !== null && (
                    <>
                        <Text style={styles.resultText}>Результат SDAI: {sdai.toFixed(1)}</Text>
                        <Text style={styles.resultText}>Активность: {interpretation}</Text>
                    </>
                )}

                {dataHistory.length > 0 && (
                    <LineChart
                        data={{
                            labels: dataHistory.map((entry) => entry.date),
                            datasets: [{data: dataHistory.map((entry) => entry.sdai), strokeWidth: 2}],
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#e8e8e8',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                    />
                )}
            </ScrollView>

            <Portal>
                <DatePickerModal
                    locale="ru" // Локализация (русский язык)
                    mode="single" // Режим: выбор одной даты
                    visible={showDatePicker}
                    onDismiss={() => setShowDatePicker(false)}
                    date={selectedDate} // Текущая выбранная дата
                    onConfirm={(params) => {
                        // Проверяем, что возвращен объект с ключом `date`
                        if (params.date) {
                            setSelectedDate(params.date); // Сохраняем выбранную дату в состояние
                        }
                        setShowDatePicker(false); // Закрываем модальное окно
                    }}
                />
            </Portal>

            {snackbarVisible && (
                <Snackbar visible={true} onDismiss={hideSnackbar} duration={3000} wrapperStyle={styles.snackbarWrapper}>
                    {errorMessage}
                </Snackbar>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: '#FFF'},
    container: {flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20},
    title: {fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20},
    input: {marginBottom: 10},
    buttonContainer: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
    calculateButton: {flex: 0.48, backgroundColor: '#5885DC'},
    clearButton: {flex: 0.48, backgroundColor: '#BB2649'},
    resultText: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 20},
    dateButton: {marginVertical: 10},
    chart: {marginVertical: 10, borderRadius: 10},
    snackbarWrapper: {
        top: 50,
        position: 'absolute',
        // left: 10,
        // right: 10,
    },
});

export default App;