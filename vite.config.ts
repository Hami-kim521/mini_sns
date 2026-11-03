import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 프로젝트 사이트(/mini_sns/) 경로에 맞춤
export default defineConfig({
  base: '/mini_sns/',
  plugins: [react()],
})
