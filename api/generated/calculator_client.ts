/**
 * Generated by orval v7.3.0 🍺
 * Do not edit manually.
 * SDAI calculator API server
 * OpenAPI spec version: 1.0.0
 */
import axios from 'axios'
import type {
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
export type GetHistoryResponseResponse = {
  history: HistoryRecord[];
};

export type CalculateResponseResponse = {
  /** Calculated SDAI index */
  sdai_index: number;
};

/**
 * Error
 */
export type GetHistoryErrorResponseResponse = Error;

/**
 * Error
 */
export type CalculateInternalErrorResponseResponse = Error;

export interface HistoryRecord {
  measure_datetime: string;
  parameters: CalculationParameters;
  sdai_index: number;
}

export interface Error {
  code?: string;
  message: string;
}

export interface CalculationParameters {
  /**
   * C-reactive protein in mg/dl
   * @minimum 0
   * @maximum 100
   */
  crp: number;
  /**
   * @minimum 0
   * @maximum 28
   */
  painful_joints: number;
  /**
   * @minimum 0
   * @maximum 100
   */
  patient_activity_assessment: number;
  /**
   * @minimum 0
   * @maximum 100
   */
  physician_activity_assessment: number;
  /**
   * @minimum 0
   * @maximum 28
   */
  swollen_joints: number;
}

export interface CalculateRequest {
  /** Measure date and time */
  measure_datetime: unknown;
  parameters: CalculationParameters;
}





  export const getSDAICalculatorAPIServer = () => {
const calculate = <TData = AxiosResponse<CalculateResponseResponse>>(
    calculateRequest: CalculateRequest, options?: AxiosRequestConfig
 ): Promise<TData> => {
    return axios.post(
      `http://localhost:8080/calculate`,
      calculateRequest,options
    );
  }

const getHistory = <TData = AxiosResponse<GetHistoryResponseResponse>>(
     options?: AxiosRequestConfig
 ): Promise<TData> => {
    return axios.get(
      `http://localhost:8080/history`,options
    );
  }

return {calculate,getHistory}};
export type CalculateResult = AxiosResponse<CalculateResponseResponse>
export type GetHistoryResult = AxiosResponse<GetHistoryResponseResponse>
