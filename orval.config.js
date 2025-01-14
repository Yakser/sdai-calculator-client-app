module.exports = {
  sdaiCalculatorAPI: {
    input: './api/schemas/openapi.yaml',
    output: {
      target: './api/generated/calculator_client.ts',
      client: 'axios',
      // baseUrl: 'http://10.0.2.2:8080',
      baseUrl: 'http://localhost:8080',
      // overrides: {
      //     mutator: {
      //         path: './src/customAxiosInstance.ts', // (Необязательно) Можно указать кастомный Axios-инстанс
      //         name: 'customAxios',                 // Импортировать экземпляр
      //     },
      // },
    },
  },
  articlesAPI: {
    input: './api/schemas/articles.yaml',
    output: {
      target: './api/generated/articles_client.ts',
      client: 'axios',
      baseUrl: 'https://d05ef42b24639bc0.mokky.dev',
    },
  },
}
