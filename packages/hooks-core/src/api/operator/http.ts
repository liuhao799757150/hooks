import { BaseTrigger, MetadataHelper, Operator, OperatorType } from '../type'

export const HttpTriggerType = 'HTTP'

export enum HttpMetadata {
  METHOD = 'Http_Method',
  QUERY = 'Http_Query',
  PARAM = 'Http_Param',
  HEADER = 'Http_Header',
  RESPONSE = 'Http_Response',
}

export enum ResponseMetaType {
  CODE = 'Http_Response_Code',
  HEADER = 'Http_Response_Header',
  CONTENT_TYPE = 'Http_Response_ContentType',
  REDIRECT = 'Http_Response_Redirect',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  ALL = 'ALL',
}

export interface HttpTrigger extends BaseTrigger {
  type: typeof HttpTriggerType
  method: HttpMethod
  path?: string
}

export type HttpInputMetadata = {
  query?: Record<string, string>
  headers?: Record<string, string>
  params?: Record<string, string>
}

function createHttpMethodOperator(method: HttpMethod) {
  return (path?: string) => {
    return {
      name: method,
      metadata({ setMetadata }) {
        setMetadata<HttpTrigger>(OperatorType.Trigger, {
          type: HttpTriggerType,
          method,
          path,
          requestClient: {
            fetcher: 'http',
            client: '@midwayjs/rpc',
          },
        })
      },
    } as Operator<void>
  }
}

// HTTP Method
export const All = createHttpMethodOperator(HttpMethod.ALL)
export const Get = createHttpMethodOperator(HttpMethod.GET)
export const Post = createHttpMethodOperator(HttpMethod.POST)
export const Delete = createHttpMethodOperator(HttpMethod.DELETE)
export const Put = createHttpMethodOperator(HttpMethod.PUT)
export const Patch = createHttpMethodOperator(HttpMethod.PATCH)
export const Head = createHttpMethodOperator(HttpMethod.HEAD)
export const Options = createHttpMethodOperator(HttpMethod.OPTIONS)

// HTTP Helper
export function Query<T extends Record<string, string>>(): Operator<{
  query: T
}> {
  return {
    name: HttpMetadata.QUERY,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.QUERY, true)
    },
  }
}

export function Param<T extends Record<string, string>>(): Operator<{
  params: T
}> {
  return {
    name: HttpMetadata.PARAM,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.PARAM, true)
    },
  }
}

export function Header<T extends Record<string, string>>(): Operator<{
  headers: T
}> {
  return {
    name: HttpMetadata.HEADER,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.HEADER, true)
    },
  }
}

export type ResponseMetaData = {
  type: ResponseMetaType
  code?: number
  header?: {
    key: string
    value: string
  }
  url?: string
  contentType?: string
}

export function HttpCode(code: number): Operator<void> {
  return {
    name: 'HttpCode',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.CODE, { code })
    },
  }
}

export function SetHeader(key: string, value: string): Operator<void> {
  return {
    name: 'SetHeader',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.HEADER, {
        header: {
          key,
          value,
        },
      })
    },
  }
}

export function Redirect(url: string, code?: number): Operator<void> {
  return {
    name: 'Redirect',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.REDIRECT, {
        url,
        code,
      })
    },
  }
}

export function ContentType(contentType: string): Operator<void> {
  return {
    name: 'ContentType',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.CONTENT_TYPE, {
        contentType,
      })
    },
  }
}

function setResponseMetaData(
  helper: MetadataHelper,
  type: ResponseMetaType,
  value: Partial<ResponseMetaData>
) {
  const responseMetaData =
    helper.getMetadata<ResponseMetaData[]>(HttpMetadata.RESPONSE) || []

  helper.setMetadata(HttpMetadata.RESPONSE, [
    ...responseMetaData,
    {
      type,
      ...value,
    },
  ])
}
