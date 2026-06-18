/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import petsRoutes from './routes/pets.js'
import medicalRecordsRoutes from './routes/medicalRecords.js'
import vaccinationsRoutes from './routes/vaccinations.js'
import medicinesRoutes from './routes/medicines.js'
import prescriptionsRoutes from './routes/prescriptions.js'
import hospitalizationsRoutes from './routes/hospitalizations.js'
import statisticsRoutes from './routes/statistics.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/pets', petsRoutes)
app.use('/api/medical-records', medicalRecordsRoutes)
app.use('/api/vaccinations', vaccinationsRoutes)
app.use('/api/medicines', medicinesRoutes)
app.use('/api/prescriptions', prescriptionsRoutes)
app.use('/api/hospitalizations', hospitalizationsRoutes)
app.use('/api/statistics', statisticsRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
