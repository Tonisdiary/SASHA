declare module 'google-search-results-nodejs' {
  export function getJson(params: {
    q: string;
    api_key: string;
    engine?: string;
    num?: number;
    gl?: string;
    hl?: string;
    [key: string]: any;
  }): Promise<any>;
}