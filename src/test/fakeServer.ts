import { vi } from "vitest";

// Answers fetch by URL path; any request without an answer rejects so a stray call fails the test.
export function serverAnswers(answers: Record<string, () => Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const path = new URL(String(input)).pathname;
    const answer = answers[path];
    return answer
      ? Promise.resolve(answer())
      : Promise.reject(new Error(`unexpected request to ${path}`));
  });
}

export function requestedPaths(fetchSpy: ReturnType<typeof serverAnswers>) {
  return fetchSpy.mock.calls.map(([input]) => new URL(String(input)).pathname);
}
