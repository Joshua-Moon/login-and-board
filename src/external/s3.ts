import AWS from 'aws-sdk'
import { s3_config } from '../config'
import { fail, Fail } from '../core'

export interface Upload {
  Key: string
  Body: Buffer
  ContentType: string
}

export interface Download {
  bucketPath: string
}

interface PreviewURI {
  previewURI: string
}

AWS.config.update({
  accessKeyId: s3_config.ACCESS_ID,
  secretAccessKey: s3_config.ACCESS_KEY,
  region: s3_config.REGION
})
const s3 = new AWS.S3()

// TODO: 업로드 방식에 대해서 생각해보기
export const s3upload = async (
  payload: Upload
): Promise<AWS.S3.ManagedUpload.SendData | Fail> => {
  try {
    return s3
      .upload({
        Bucket: s3_config.BUCKET,
        Key: payload.Key,
        Body: payload.Body,
        ContentType: payload.ContentType
      })
      .promise()
  } catch (e) {
    const err = 'aws-sdk error'
    return fail(err as string, 500)
  }
}

export const s3downlaod = async (
  bucketPath: string
): Promise<Buffer | Fail> => {
  const key = bucketPath
  try {
    const stream = await getS3Object(key)
    return stream
  } catch (e) {
    const err = 'aws-sdk error'
    return fail(err as string, 500)
  }
}

export const getPublicURI = async (
  previewURI: string,
  expiryTime: number
): Promise<PreviewURI | Fail> => {
  const key = previewURI
  try {
    const publicURI = await s3.getSignedUrlPromise('getObject', {
      Bucket: s3_config.CONTENTS_BUCKET,
      Key: key,
      Expires: expiryTime
    })
    return {
      previewURI: publicURI
    }
  } catch (e) {
    const err = 'aws-sdk error'
    return fail(err as string, 500)
  }
}

async function getS3Object(key: string): Promise<any> {
  return s3
    .getObject({ Bucket: s3_config.CONTENTS_BUCKET, Key: key })
    .createReadStream()
}
