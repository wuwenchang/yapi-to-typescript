import {RequestConfig, RequestFunctionParams} from './types'

export class FileData<T = any> {
  /**
   * 原始文件数据。
   */
  private originalFileData: T

  /**
   * 文件数据辅助类，统一网页、小程序等平台的文件上传。
   *
   * @param originalFileData 原始文件数据
   */
  public constructor(originalFileData: T) {
    this.originalFileData = originalFileData
  }

  /**
   * 获取原始文件数据。
   *
   * @returns 原始文件数据
   */
  public getOriginalFileData(): T {
    return this.originalFileData
  }
}

/**
 * 解析请求数据，从请求数据中分离出普通数据和文件数据。
 *
 * @param [requestData] 要解析的请求数据
 * @returns 包含普通数据(data)和文件数据(fileData)的对象，data、fileData 为空对象时，表示没有此类数据
 */
export function parseRequestData(requestData?: any): { data: any, fileData: any } {
  const result = {
    data: {} as any,
    fileData: {} as any,
  }
  if (requestData != null) {
    if (typeof requestData === 'object' && !Array.isArray(requestData)) {
      Object.keys(requestData).forEach(key => {
        if (requestData[key] && requestData[key] instanceof FileData) {
          result.fileData[key] = (requestData[key] as FileData).getOriginalFileData()
        } else {
          result.data[key] = requestData[key]
        }
      })
    } else {
      result.data = requestData
    }
  }
  return result
}

/**
 * 准备要传给请求函数的参数。
 */
export function prepare(requestConfig: RequestConfig, requestData: any): RequestFunctionParams {
  let requestPath = requestConfig.path
  const {data, fileData} = parseRequestData(requestData)
  if (Array.isArray(requestConfig.paramNames) && requestConfig.paramNames.length > 0 && data != null && typeof data === 'object' && !Array.isArray(data)) {
    Object.keys(data).forEach(key => {
      if (requestConfig.paramNames.indexOf(key) >= 0) {
        // ref: https://github.com/YMFE/yapi/blob/master/client/containers/Project/Interface/InterfaceList/InterfaceEditForm.js#L465
        requestPath = requestPath
          .replace(new RegExp(`\\{${key}\\}`, 'g'), data[key])
          .replace(new RegExp(`/:${key}(?=/|$)`, 'g'), `/${data[key]}`)
        delete data[key]
      }
    })
  }
  return {
    ...requestConfig,
    path: requestPath,
    data: data,
    fileData: fileData,
  }
}
