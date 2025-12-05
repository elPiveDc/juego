import axios, { AxiosInstance } from "axios";

export class AdaptadorAxios {
  private cliente: AxiosInstance;

  constructor(baseURL: string) {
    this.cliente = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });
  }

  get<T>(url: string, params?: any) {
    return this.cliente.get<T>(url, { params }).then((r) => r.data);
  }

  post<T>(url: string, body: any) {
    return this.cliente.post<T>(url, body).then((r) => r.data);
  }
}
