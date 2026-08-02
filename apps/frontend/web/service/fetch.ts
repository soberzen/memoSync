import type { BeforeRequestHook, AfterResponseHook, Hooks } from 'ky';

import ky, { HTTPError } from 'ky';
import { API_PREFIX } from '@/config';
import { showToast } from '@/utils/toast';
import { getToken, setToken } from '@/utils/auth';

import type { IOtherOptions } from './base';

const TIME_OUT = 100000;

export const ContentType = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  download: 'application/octet-stream',
  upload: 'multipart/form-data',
};

export type HTTPResponse<T> = {
  code: string;
  message: string;
  data: T;
};

type ResponseError = HTTPResponse<null>;

export type AccessTokenResponse = HTTPResponse<{ accessToken: string }>;

export type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>;
  body?: BodyInit | Record<string, any> | null;
};

const afterResponseErrorCode = (
  otherOptions: IOtherOptions
): AfterResponseHook => {
  return async ({ response }) => {
    if (!/^([23])\d{2}$/.test(String(response.status))) {
      const errorData = await response
        .clone()
        .json()
        .then((data) => data as ResponseError)
        .catch(() => null);
      const shouldNotifyError =
        response.status !== 401 && errorData && !otherOptions.silent;
      if (shouldNotifyError) {
        showToast.error(errorData.message);
      }
    }
  };
};

const afterResponseAccessToken: AfterResponseHook = async ({ response }) => {
  if (/^2\d{2}$/.test(String(response.status))) {
    const accessTokenData = await response
      .json()
      .then((data) => data as AccessTokenResponse);
    const accessToken = accessTokenData.data?.accessToken;
    setToken(accessToken);
  }
};

const beforeRequest: BeforeRequestHook = ({ request }) => {
  const token = getToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
};

const baseHooks: Hooks = {
  afterResponse: [afterResponseAccessToken],
  beforeRequest: [beforeRequest],
};

const baseClient = ky.create({
  timeout: TIME_OUT,
  hooks: baseHooks,
});

const isPlainObject = (val: unknown) =>
  val !== null &&
  typeof val === 'object' &&
  Object.getPrototypeOf(val) === Object.prototype;

async function base<T>(
  url: string,
  options: FetchOptionType = {},
  otherOptions: IOtherOptions = {}
) {
  const { params, body, headers: headerInit, ...restOptions } = options;

  const headers = new Headers(headerInit);
  const isJsonBody = isPlainObject(body);
  const { getAbortController } = otherOptions;
  if (!isJsonBody && typeof body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', ContentType.json);
  }

  const abortController = new AbortController();

  const fetchPathname = API_PREFIX + (url.startsWith('/') ? url : `/${url}`);

  if (getAbortController) {
    getAbortController(abortController);
  }
  options.signal = abortController.signal;

  const client = baseClient.extend({
    hooks: {
      ...baseHooks,
      afterResponse: [afterResponseErrorCode(otherOptions)],
    },
  });
  let res: Response;
  try {
    res = await client(fetchPathname, {
      ...restOptions,
      headers,
      searchParams: params || undefined,
      ...(isJsonBody ? { json: body } : { body: body as BodyInit }),
    });

    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes(ContentType.download)) {
      return (await res.blob()) as T;
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof HTTPError) {
      throw error.request.clone();
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      throw '请求被取消';
    }
    throw error;
  }
}

export { base };
