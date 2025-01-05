import React, {useEffect, useState, useCallback} from "react";
import {getSDAICalculatorAPIServer, SDAIRecord} from "@/api/generated/client";
import {ActivityIndicator, Text, Button} from "react-native-paper";
import {Dimensions, ScrollView, StyleSheet, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {LineChart} from "react-native-chart-kit";
import {useFocusEffect} from '@react-navigation/native';

const ChartTab: React.FC = () => {
    const api = getSDAICalculatorAPIServer();

    const [loading, setLoading] = useState<boolean>(true);
    const [dataHistory, setDataHistory] = useState<SDAIRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getHistory();
            setDataHistory(response.data.history.slice(-15));
        } catch (error) {
            console.error("Ошибка загрузки данных истории:", error);
            setError("Не удалось загрузить данные. Проверьте подключение.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.contentContainer}>
                <ActivityIndicator size="large" color="#4682B4" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.contentContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={loadHistory} style={styles.refreshButton}>
                    Обновить данные
                </Button>
            </View>
        );
    }

    if (dataHistory.length === 0) {
        return (
            <View style={styles.contentContainer}>
                <Text>Нет доступных данных для графика.</Text>
                <Button mode="contained" onPress={loadHistory} style={styles.refreshButton}>
                    Обновить данные
                </Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>История SDAI</Text>
                <Button mode="outlined" onPress={loadHistory} style={styles.refreshButton}>
                    Обновить данные
                </Button>
                <LineChart
                    data={{
                        labels: dataHistory.map((entry, index) =>
                            index % 2 === 0
                                ? new Date(entry.measure_datetime).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                })
                                : ""
                        ),
                        datasets: [
                            {
                                data: dataHistory.map((entry) => entry.sdai_index),
                                strokeWidth: 2,
                            },
                        ],
                    }}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: "#f0f8ff",
                        backgroundGradientFrom: "#87CEEB",
                        backgroundGradientTo: "#4682B4",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 10,
                        },
                        propsForDots: {
                            r: "3",
                            strokeWidth: "1",
                            stroke: "#4682B4",
                        },
                        propsForLabels: {
                            fontSize: 10,
                        },
                    }}
                    style={{
                        marginVertical: 10,
                        borderRadius: 10,
                    }}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    bezier
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    refreshButton: {
        marginVertical: 10,
        alignSelf: "center",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
});

export default ChartTab;