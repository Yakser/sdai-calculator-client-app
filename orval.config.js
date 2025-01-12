module.exports = {
  sdaiCalculatorAPI: {
    input: './api/schemas/openapi.yaml',
    output: {
      target: './api/generated/client.ts',
      client: 'axios',
      baseUrl: 'http://10.0.2.2:8080',
      // overrides: {
      //     mutator: {
      //         path: './src/customAxiosInstance.ts', // (Необязательно) Можно указать кастомный Axios-инстанс
      //         name: 'customAxios',                 // Импортировать экземпляр
      //     },
      // },
    },
  },
}
