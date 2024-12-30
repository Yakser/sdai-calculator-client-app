import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { TextInput, Button, HelperText, Text, Portal } from 'react-native-paper';
import { DatePickerModal, registerTranslation } from 'react-native-paper-dates';
import { LineChart } from 'react-native-chart-kit';
import {RangeChange} from "react-native-paper-dates/lib/typescript/Date/Calendar";

// Регистрируем русскую локализацию
registerTranslation('ru', {
    close: "", dateIsDisabled: "", hour: "", minute: "", mustBeBetween(startDate: string, endDate: string): string {
        return "";
    }, mustBeHigherThan(date: string): string {
        return "";
    }, mustBeLowerThan(date: string): string {
        return "";
    }, next: "", notAccordingToDateFormat(inputFormat: string): string {
        return "";
    }, pickDateFromCalendar: "", previous: "", selectMultiple: "", typeInDate: "",
    save: 'Сохранить',
    selectSingle: 'Выбор даты',
    // cancel: 'Отменить',
    // today: 'Сегодня',
    selectRange: 'Выбрать период'
    // startDate: 'Начальная дата',
    // endDate: 'Конечная дата',
});

const App: React.FC = () => {
    const [tenderJoints, setTenderJoints] = useState<string>('');
    const [swollenJoints, setSwollenJoints] = useState<string>('');
    const [physicianAssessment, setPhysicianAssessment] = useState<string>('');
    const [patientAssessment, setPatientAssessment] = useState<string>('');
    const [crp, setCrp] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Используем undefined для совместимости
    const [dataHistory, setDataHistory] = useState<{ date: string; sdai: number }[]>([]);
    const [sdai, setSdai] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const calculateSDAI = () => {
        if (!validateInput()) return;

        const calculatedSDAI =
            Number(tenderJoints) +
            Number(swollenJoints) +
            Number(physicianAssessment) / 10 +
            Number(patientAssessment) / 10 +
            Number(crp);

        setSdai(calculatedSDAI);

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

        // Сохраняем данные в историю
        const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
        setDataHistory([...dataHistory, { date: formattedDate, sdai: calculatedSDAI }]);
    };

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

    const onDismissDate = () => {
        setShowDatePicker(false);
    };

    const onConfirmDate: RangeChange = (params) => {
        setShowDatePicker(false);
        setSelectedDate(params.startDate);
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
                    placeholder="Введите число болезненных суставов"
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
                    placeholder="Введите число припухших суставов"
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
                    placeholder="Введите оценку врача"
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
                    placeholder="Введите оценку пациента"
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
                    placeholder="Введите уровень С-реактивного белка"
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
                    {selectedDate ? `Дата: ${selectedDate.toISOString().split('T')[0]}` : 'Выберите дату'}
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
                        Рассчитать
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

                <Text style={styles.historyTitle}>История результатов</Text>
                {dataHistory.length > 0 && (
                    <LineChart
                        data={{
                            labels: dataHistory.map((entry) => entry.date),
                            datasets: [
                                {
                                    data: dataHistory.map((entry) => entry.sdai),
                                    strokeWidth: 2,
                                },
                            ],
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        yAxisSuffix=""
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
                    locale="ru"
                    mode="single"
                    visible={showDatePicker}
                    onDismiss={onDismissDate}
                    date={selectedDate}
                    onConfirm={(params) => {
                        if ('date' in params) {
                            setSelectedDate(params.date);
                        }
                        setShowDatePicker(false);
                    }}
                />
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    calculateButton: {
        flex: 0.48,
        backgroundColor: '#5885DC',
    },
    clearButton: {
        flex: 0.48,
        backgroundColor: '#BB2649',
    },
    resultText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    dateButton: {
        marginVertical: 10,
    },
    historyTitle: {
        marginTop: 30,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    chart: {
        marginVertical: 10,
        borderRadius: 10,
    },
});

export default App;