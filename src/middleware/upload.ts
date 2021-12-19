import multer from 'multer'

export const upload_middleware = multer({ storage: multer.memoryStorage() })
