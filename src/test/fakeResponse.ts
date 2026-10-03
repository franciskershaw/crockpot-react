export function fakeResponse(ok: boolean, status: number, body: unknown = {}) {
  return {
    ok,
    status,
    headers: new Headers(),
    json: () => Promise.resolve(body),
  } as Response;
}
