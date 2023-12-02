import { defineConfig } from 'cypress'

export default defineConfig({
  
  e2e: {
    'baseUrl': 'http://localhost:4200',
    supportFile: false
  },
  
  env: {
    baseUrlBack: "https://www.yangzhen.tech/notes3waapi/public/api",
    //baseUrlBack: "http://127.0.0.1:8000/api"
  },
  
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  }
  
})